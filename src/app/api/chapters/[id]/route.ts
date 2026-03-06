import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const id = params.id;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const { error: updateError } = await supabase
      .from("chapters")
      .update({
        title_raw: body.title,
        content_raw: body.content,
        chapter_index: body.chapter_index,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError)
      throw new Error("Failed to update chapter: " + updateError.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
