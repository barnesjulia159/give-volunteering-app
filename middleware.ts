// import { updateSession } from "@/lib/supabase/middleware";

export async function middleware() {
  // no-op for now
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};