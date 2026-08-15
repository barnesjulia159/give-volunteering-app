import Link from "next/link";
import { RoleGate } from "@/components/RoleGate";
import { createClient } from "@/lib/supabase/server";
import { AVAILABILITY_DAYS } from "@/lib/types";

function parseSkillsAndCauses(raw: string | null): {
  skills: string[];
  causes: string[];
} {
  if (!raw) return { skills: [], causes: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      causes: Array.isArray(parsed.causes) ? parsed.causes : [],
    };
  } catch {
    return { skills: [], causes: [] };
  }
}

function parseAvailability(raw: string | null) {
  const days: { day: string; am: boolean; pm: boolean }[] = [];
  let parsed: Record<string, { am?: boolean; pm?: boolean }> = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
  }
  for (const day of AVAILABILITY_DAYS) {
    days.push({
      day,
      am: Boolean(parsed[day]?.am),
      pm: Boolean(parsed[day]?.pm),
    });
  }
  return days;
}

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
    .select(
      "display_name, first_name, bio, availability_notes, phone, city, state, zip_code, skillsAndCauses"
    )
    .eq("id", user!.id)
    .single();

  const { count: activeBookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("volunteer_id", user!.id)
    .eq("status", "booked");

  const displayName =
    profile?.display_name || profile?.first_name || user?.email || "Volunteer";

  const location = [profile?.city, profile?.state, profile?.zip_code]
    .filter(Boolean)
    .join(", ");

  const { skills, causes } = parseSkillsAndCauses(profile?.skillsAndCauses ?? null);
  const availability = parseAvailability(profile?.availability_notes ?? null);
  const availableDays = availability.filter((d) => d.am || d.pm);

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
            Update your contact details, settings and availability.
          </p>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Bio</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">
            {profile?.bio || "No biography has been added yet."}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Contact</h2>
          <dl className="mt-2 space-y-2 text-slate-700">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </dt>
              <dd>{profile?.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </dt>
              <dd>{location || "Not provided"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Availability</h2>
          {availableDays.length === 0 ? (
            <p className="mt-2 text-slate-500">No availability has been set.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-slate-700">
              {availableDays.map(({ day, am, pm }) => (
                <li key={day} className="capitalize">
                  {day}: {[am && "AM", pm && "PM"].filter(Boolean).join(", ")}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Skills &amp; Causes</h2>
          {skills.length === 0 && causes.length === 0 ? (
            <p className="mt-2 text-slate-500">
              No skills and causes have been added.
            </p>
          ) : (
            <div className="mt-2 space-y-3">
              {skills.length > 0 && (
                <div className="skills-container">
                  {skills.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
              {causes.length > 0 && (
                <div className="skills-container">
                  {causes.map((cause) => (
                    <span key={cause} className="skill-tag">
                      {cause}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
