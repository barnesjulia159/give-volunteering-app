"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateVolunteerProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = {
    first_name: String(formData.get("first_name") || "").trim(),
    last_name: String(formData.get("last_name") || "").trim(),
    display_name: String(formData.get("display_name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    state: String(formData.get("state") || "").trim(),
    zip_code: String(formData.get("zip_code") || "").trim(),
    bio: String(formData.get("bio") || "").trim(),
    availability_notes: String(formData.get("availability_notes") || "").trim(),
  };

  const { error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", user.id);

  if (error) {
    redirect(`/volunteer/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/volunteer/profile?message=Profile updated.");
}
