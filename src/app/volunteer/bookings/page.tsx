import Link from "next/link";
import { RoleGate } from "@/components/RoleGate";
import { SubmitButton } from "@/components/SubmitButton";
import { cancelBooking } from "@/lib/actions/bookings";
import { createClient } from "@/lib/supabase/server";
import { BookingWithOpportunity } from "@/lib/types";

type VolunteerBookingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function VolunteerBookingsPage({
  searchParams,
}: VolunteerBookingsPageProps) {
  const params = await searchParams;

  return (
    <RoleGate allowedRoles={["volunteer"]}>
      <VolunteerBookingsContent message={params.message} error={params.error} />
    </RoleGate>
  );
}

async function VolunteerBookingsContent({
  message,
  error,
}: {
  message?: string;
  error?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("bookings")
    .select(
      `
      *,
      opportunities (
        *,
        organizations (
          name
        )
      )
    `
    )
    .eq("volunteer_id", user!.id)
    .neq("status", "cancelled")
    .order("booked_at", { ascending: false });

  const bookings = (data || []) as BookingWithOpportunity[];

  return (
    <section>
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="mt-2 text-slate-700">
          View and manage your current volunteer commitments.
        </p>
      </div>

      {message && <p className="alert-info mb-4">{message}</p>}
      {error && <p className="alert-error mb-4">{error}</p>}

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-slate-700">
            You do not have any active bookings yet.
          </p>
          <Link
            href="/opportunities"
            className="mt-4 inline-flex rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
          >
            Browse Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const opportunity = booking.opportunities;
            const startDate = new Date(opportunity.start_at);

            return (
              <article
                key={booking.id}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">
                      {opportunity.organizations?.name}
                    </p>

                    <h2 className="text-2xl font-semibold">
                      {opportunity.title}
                    </h2>

                    <p className="mt-2 text-slate-700">
                      {startDate.toLocaleDateString()} at{" "}
                      {startDate.toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>

                    <p className="text-slate-700">
                      {[opportunity.location_name, opportunity.city, opportunity.state]
                        .filter(Boolean)
                        .join(", ") || "Location TBD"}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      Status: {booking.status}
                    </p>
                  </div>

                  <form action={cancelBooking}>
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <SubmitButton
                      className="bg-red-700 hover:bg-red-800"
                      pendingText="Cancelling..."
                    >
                      Cancel Booking
                    </SubmitButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
