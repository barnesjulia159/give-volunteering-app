import Link from "next/link";
import { RoleGate } from "@/components/RoleGate";
import { createClient } from "@/lib/supabase/server";

export default async function VolunteerDashboardPage() {
  return (
    <RoleGate allowedRoles={["volunteer"]}>
      <VolunteerDashboardContent />
    </RoleGate>
  );
}

async function VolunteerDashboardContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, first_name")
    .eq("id", user!.id)
    .single();

  const { count: activeBookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("volunteer_id", user!.id)
    .eq("status", "booked");

  const displayName =
    profile?.display_name || profile?.first_name || user?.email || "Volunteer";

  return (
    <section>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-4xl font-bold">Welcome, {displayName}</h1>
        <p className="mt-2 text-slate-700">
          Use your dashboard to discover opportunities, manage your bookings,
          and keep your volunteer profile up to date.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Bookings</p>
          <p className="mt-2 text-4xl font-bold text-emerald-700">
            {activeBookingCount ?? 0}
          </p>
        </div>

        <Link
          href="/opportunities"
          className="rounded-xl bg-white p-5 shadow-sm hover:ring-2 hover:ring-emerald-600"
        >
          <h2 className="text-xl font-semibold">Find Opportunities</h2>
          <p className="mt-2 text-slate-700">
            Browse available volunteer opportunities near you.
          </p>
        </Link>

        <Link
          href="/volunteer/profile"
          className="rounded-xl bg-white p-5 shadow-sm hover:ring-2 hover:ring-emerald-600"
        >
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <p className="mt-2 text-slate-700">
            Update your contact details, interests, and availability.
          </p>
        </Link>
      </div>
    </section>
  );
}
