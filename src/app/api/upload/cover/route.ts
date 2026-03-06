import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) throw new Error("No file provided");

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("covers") // Assuming a storage bucket named "covers"
      .upload(fileName, file);

    if (uploadError) throw new Error("Upload failed: " + uploadError.message);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("covers").getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
