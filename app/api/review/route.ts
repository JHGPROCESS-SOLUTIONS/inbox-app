import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

function isUuid(s: string) {
  return /^[0-9a-f-]{36}$/i.test(s);
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { id, action, draft_reply } = await req.json().catch(() => ({}));

  if (!id || !isUuid(id))
    return new NextResponse("Invalid id", { status: 400 });

  if (!["save", "approve"].includes(action))
    return new NextResponse("Invalid action", { status: 400 });

  // Save draft in messages
  const { error: saveErr } = await supabase
    .from("messages")
    .update({ draft_reply: draft_reply ?? "" })
    .eq("id", id);

  if (saveErr)
    return new NextResponse(saveErr.message, { status: 400 });

  if (action === "approve") {
    const { data, error: approveErr } = await supabase
      .from("messages")
      .update({ status: "READY_TO_SEND" })
      .eq("id", id)
      .select("id, status")
      .maybeSingle();

    if (approveErr)
      return new NextResponse(approveErr.message, { status: 400 });

    if (!data)
      return new NextResponse("No row updated (RLS?)", { status: 403 });
  }

  return NextResponse.json({ ok: true });
}