import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TenantPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <div style={{ padding: 24 }}>
      <h1>Create tenant (test)</h1>

      <form action="/tenant/create" method="post" style={{ marginTop: 12 }}>
        <input
          name="tenant_name"
          placeholder="Tenant name"
          defaultValue="JHG Process Solutions"
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Create tenant
        </button>
      </form>
    </div>
  );
}