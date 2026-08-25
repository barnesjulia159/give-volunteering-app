import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function calculateHours(checkIn: Date | null, checkOut: Date | null) {
  if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
  return (checkOut.getTime() - checkIn.getTime()) / 3_600_000;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedUserId = url.searchParams.get("userId");
  const opportunityId = url.searchParams.get("opportunityId");
  const targetUserId = requestedUserId || user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  if (requestedUserId && requestedUserId !== user.id && !isAdmin) {
    return NextResponse.json(
      { message: "You can only view your own logged hours" },
      { status: 403 }
    );
  }

  if (opportunityId && !isAdmin) {
    const { data: organization } = await supabase
      .from("organizations")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    const { data: opportunity } = await supabase
      .from("opportunities")
      .select("id")
      .eq("id", opportunityId)
      .eq("organization_id", organization?.id ?? "")
      .maybeSingle();

    if (!opportunity) {
      return NextResponse.json(
        { message: "You can only view hours for your opportunities" },
        { status: 403 }
      );
    }
  }

  const where = opportunityId
    ? { booking: { opportunity_id: opportunityId } }
    : { booking: { volunteer_id: targetUserId } };

  const [attendanceLogs, manualHours] = await Promise.all([
    prisma.attendanceLog.findMany({
      where,
      orderBy: { recorded_at: "desc" },
      include: {
        booking: {
          select: {
            volunteer_id: true,
            opportunity_id: true,
            opportunity: { select: { title: true } },
          },
        },
      },
    }),
    prisma.volunteerHour.findMany({
      where: opportunityId
        ? { opportunity_id: opportunityId }
        : { volunteer_id: targetUserId },
      orderBy: { recorded_at: "desc" },
      include: { opportunity: { select: { title: true } } },
    }),
  ]);

  const data = [
    ...attendanceLogs.map((log) => ({
      id: log.id,
      bookingId: log.booking_id,
      volunteerId: log.booking.volunteer_id,
      opportunityId: log.booking.opportunity_id,
      opportunityTitle: log.booking.opportunity.title,
      status: log.status,
      source: "attendance" as const,
      checkInAt: log.check_in_at,
      checkOutAt: log.check_out_at,
      recordedAt: log.recorded_at,
      hours: calculateHours(log.check_in_at, log.check_out_at),
      notes: log.notes,
    })),
    ...manualHours.map((entry) => ({
      id: entry.id,
      bookingId: null,
      volunteerId: entry.volunteer_id,
      opportunityId: entry.opportunity_id,
      opportunityTitle: entry.opportunity.title,
      status: "manual",
      source: "manual" as const,
      checkInAt: null,
      checkOutAt: null,
      recordedAt: entry.recorded_at,
      hours: entry.hours,
      notes: entry.notes,
    })),
  ].sort((first, second) => second.recordedAt.getTime() - first.recordedAt.getTime());
  const totalHours = data.reduce((total, log) => total + log.hours, 0);

  return NextResponse.json({
    data,
    totalHours: Number(totalHours.toFixed(2)),
  });
}
