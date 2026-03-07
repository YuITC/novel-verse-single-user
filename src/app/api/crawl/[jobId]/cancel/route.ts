import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { crawlJobs } from "@/lib/crawlers/engine";

export async function POST(
  req: Request,
  props: { params: Promise<{ jobId: string }> },
) {
  const params = await props.params;
  const jobId = params.jobId;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cancellation logic: update DB, then check if currently running and emit cancel.
  await supabase
    .from("crawl_jobs")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", jobId);

  const emitter = crawlJobs.get(jobId);
  if (emitter) {
    emitter.cancelled = true;
    emitter.emit("phase", "cancelled");
    emitter.addLog("error", "Job was cancelled by user.");
    setTimeout(() => crawlJobs.delete(jobId), 10000);
  }

  return NextResponse.json({ success: true, message: "Job cancelled" });
}
