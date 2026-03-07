import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retryBackgroundCrawl } from "@/lib/crawlers/engine";

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

  try {
    // Start background task (don't await)
    retryBackgroundCrawl(jobId, user.id);

    return NextResponse.json({
      success: true,
      message: "Retry job started",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
