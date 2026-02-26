import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await supabaseServer();

  let body: any = null;
  try {
    body = await request.json();
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const id = String(body?.id ?? "");
  const status = String(body?.status ?? "");

  if (!id || !["NEW", "NEEDS_REVIEW", "CLASSIFIED"].includes(status)) {
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  if (!data) {
    return new NextResponse("No row updated (RLS blocked or wrong id)", {
      status: 409,
    });
  }

  return NextResponse.json({ ok: true, updated: data });
}