import { supabaseServer } from "@/lib/supabase/server";

export async function getActiveTenant() {
  const supabase = await supabaseServer();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return null;

  const { data: membership, error } = await supabase
    .from("tenant_members")
    .select("tenant_id, role")
    .eq("user_id", userData.user.id)
    .single();

  if (error) return null;

  return {
    user: userData.user,
    tenant_id: membership.tenant_id as string,
    role: membership.role as string,
  };
}