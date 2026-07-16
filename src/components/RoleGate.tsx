import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";

type RoleGateProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

export async function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active || !allowedRoles.includes(profile.role)) {
    redirect("/");
  }

  return <>{children}</>;
}
