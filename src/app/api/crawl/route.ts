import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runBackgroundCrawl, getNovelIdFromUrl } from "@/lib/crawlers/engine";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

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
