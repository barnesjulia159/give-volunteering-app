import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-2 text-slate-600">
        Access your GIVE account to manage bookings or opportunities.
      </p>

      {params.error && <p className="alert-error mt-4">{params.error}</p>}
      {params.message && <p className="alert-info mt-4">{params.message}</p>}

      <form action={signIn} className="mt-6 space-y-4">
        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input id="email" name="email" type="email" required className="form-input" />
        </div>

        <div className="form-field">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input id="password" name="password" type="password" required className="form-input" />
        </div>

        <SubmitButton className="w-full">Log in</SubmitButton>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-emerald-700 hover:underline">
          Register
        </Link>
      </p>
    </section>
  );
}
