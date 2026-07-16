"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createBooking(formData: FormData) {
  const opportunityId = String(formData.get("opportunity_id") || "");
  const notes = String(formData.get("notes") || "").trim();

  if (!opportunityId) {
    redirect("/opportunities?error=Missing opportunity ID.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("bookings").insert({
    opportunity_id: opportunityId,
    volunteer_id: user.id,
    notes,
    status: "booked",
  });

  if (error) {
    redirect(`/opportunities/${opportunityId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/volunteer/bookings?message=You are booked for this opportunity.");
}

export async function cancelBooking(formData: FormData) {
  const bookingId = String(formData.get("booking_id") || "");

  if (!bookingId) {
    redirect("/volunteer/bookings?error=Missing booking ID.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    redirect(`/volunteer/bookings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/volunteer/bookings?message=Booking cancelled.");
}
