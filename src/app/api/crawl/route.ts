import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  runBackgroundCrawl,
  getNovelIdFromUrl,
  crawlJobs,
} from "@/lib/crawlers/engine";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: activeJobs, error: fetchError } = await supabase
    .from("crawl_jobs")
    .select(
      "*, novels(title_raw, author_raw, cover_url, description_raw, total_chapters)",
    )
    .eq("user_id", user.id)
    .in("status", ["pending", "running"])
    .order("created_at", { ascending: false });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Enrich with in-memory data if available
  const enrichedJobs = activeJobs.map((job) => {
    const emitter = crawlJobs.get(job.id);
    if (emitter && (emitter as any).history) {
      return {
        ...job,
        memory_history: (emitter as any).history,
      };
    }
    return job;
  });

  return NextResponse.json(enrichedJobs);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error in crawl route:", authError);
    return NextResponse.json(
      {
        error: "Unauthorized",
        details:
          authError?.message ||
          "No user session found. Please login at http://127.0.0.1:54323/project/default/auth/users manually if needed.",
      },
      { status: 401 },
    );
  }

  try {
    let { url, force } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    url = url.trim();

    let sourceNovelId: string;
    try {
      sourceNovelId = getNovelIdFromUrl(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid or unsupported URL" },
        { status: 400 },
      );
    }

    // Create novel record if it doesn't exist (we will update metadata later in engine)
    const origin = new URL(url).origin;
    let novelId: string;

    const { data: existingNovel } = await supabase
      .from("novels")
      .select("id")
      .eq("source_url", url)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingNovel && !force) {
      return NextResponse.json({
        isDuplicate: true,
        novelId: existingNovel.id,
        message: "Already in library. Update instead?",
      });
    }

    if (existingNovel) {
      novelId = existingNovel.id;
    } else {
      const { data: newNovel, error: insertError } = await supabase
        .from("novels")
        .insert({
          title_raw: `Fetching...`,
          user_id: user.id,
          source_url: url,
          source_origin: origin,
          publication_status: "ongoing",
        })
        .select()
        .single();

      if (insertError)
        throw new Error(
          "Failed to create novel record: " + insertError.message,
        );
      novelId = newNovel.id;
    }

    // Add novel to library if not there
    await supabase.from("library_entries").upsert(
      {
        user_id: user.id,
        novel_id: novelId,
        reading_status: "read-later",
      },
      { onConflict: "user_id,novel_id" },
    );

    // Create crawl job
    const { data: job, error: jobError } = await supabase
      .from("crawl_jobs")
      .insert({
        user_id: user.id,
        novel_id: novelId,
        source_url: url,
        status: "pending",
      })
      .select()
      .single();

    if (jobError)
      throw new Error("Failed to create crawl job: " + jobError.message);

    // Start background task (don't await)
    runBackgroundCrawl(job.id, url, user.id, novelId);

    return NextResponse.json({
      jobId: job.id,
      novelId,
      message: "Crawl started",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
