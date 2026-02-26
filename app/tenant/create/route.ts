import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await supabaseServer();
  const formData = await request.formData();
  const tenantName = String(formData.get("tenant_name") ?? "").trim();

  if (!tenantName) {
    return NextResponse.redirect(new URL("/tenant", request.url), { status: 303 });
  }

  const { error } = await supabase.rpc("create_tenant_for_user", {
    tenant_name: tenantName,
  });

  if (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return NextResponse.redirect(new URL("/inbox", request.url), { status: 303 });
}