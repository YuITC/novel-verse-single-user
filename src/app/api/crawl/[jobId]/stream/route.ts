import { NextRequest } from "next/server";
import { crawlJobs } from "@/lib/crawlers/engine";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ jobId: string }> },
) {
  const params = await props.params;
  const jobId = params.jobId;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if job exists in memory
  const emitter = crawlJobs.get(jobId);

  // Setup SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          // Need to properly escape newlines in data for SSE
          const dataStr = JSON.stringify(data);
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${dataStr}\n\n`),
          );
        } catch (e) {
          console.error("Stream closed", e);
        }
      };

      if (!emitter) {
        // If not in memory, check DB for past job
        const { data: job } = await supabase
          .from("crawl_jobs")
          .select("*")
          .eq("id", jobId)
          .single();
        if (job) {
          sendEvent("phase", job.status);
          sendEvent("progress", {
            success: job.successful_chapters,
            failed: job.failed_chapters,
            total: job.total_chapters,
          });
        } else {
          sendEvent("error", { message: "Job not found" });
        }
        controller.close();
        return;
      }

      // Small delay to ensure client is ready and connected
      // eslint-disable-next-line no-promise-executor-return
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Initial connecting state
      const history = (emitter as any).history;

      if (history) {
        sendEvent("phase", history.phase || "fetching_meta");

        // Replay history
        if (history.metadata) {
          sendEvent("metadata", history.metadata);
        }
        history.logs.forEach((log: any) => sendEvent("log", log));
        history.chapters.forEach((chapter: any) =>
          sendEvent("chapter", chapter),
        );
        if (history.progress) {
          sendEvent("progress", history.progress);
        }
      } else {
        // Fallback for legacy emitters or missing history
        sendEvent("phase", "fetching_meta");
      }

      // Attach event listeners
      const onPhase = (phase: string) => sendEvent("phase", phase);
      const onLog = (log: any) => sendEvent("log", log);
      const onMetadata = (meta: any) => sendEvent("metadata", meta);
      const onChapter = (chapter: any) => sendEvent("chapter", chapter);
      const onProgress = (progress: any) => sendEvent("progress", progress);
      const onError = (error: any) => sendEvent("error", error);

      emitter.on("phase", onPhase);
      emitter.on("log", onLog);
      emitter.on("metadata", onMetadata);
      emitter.on("chapter", onChapter);
      emitter.on("progress", onProgress);
      emitter.on("error", onError);

      // Cleanup function
      const cleanup = () => {
        emitter.off("phase", onPhase);
        emitter.off("log", onLog);
        emitter.off("metadata", onMetadata);
        emitter.off("chapter", onChapter);
        emitter.off("progress", onProgress);
        emitter.off("error", onError);
        emitter.off("phase", checkEnd);
      };

      // Close stream when phase is completed or failed
      function checkEnd(phase: string) {
        if (
          phase === "completed" ||
          phase === "failed" ||
          phase === "cancelled"
        ) {
          cleanup();
          setTimeout(() => {
            try {
              controller.close();
            } catch {
              // Ignore
            }
          }, 1000);
        }
      }

      emitter.on("phase", checkEnd);

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        cleanup();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
