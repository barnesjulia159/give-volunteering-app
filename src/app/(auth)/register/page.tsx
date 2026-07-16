import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold">Create an account</h1>
      <p className="mt-2 text-slate-600">
        Register as a volunteer or nonprofit coordinator.
      </p>

      {params.error && <p className="alert-error mt-4">{params.error}</p>}

      <form action={signUp} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-field">
            <label htmlFor="first_name" className="form-label">
              First Name
            </label>
            <input id="first_name" name="first_name" className="form-input" />
          </div>

          <div className="form-field">
            <label htmlFor="last_name" className="form-label">
              Last Name
            </label>
            <input id="last_name" name="last_name" className="form-input" />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="role" className="form-label">
            Account Type
          </label>
          <select id="role" name="role" className="form-input" defaultValue="volunteer">
            <option value="volunteer">Volunteer</option>
            <option value="nonprofit">Nonprofit Organization</option>
          </select>
        </div>

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

        <SubmitButton className="w-full">Create Account</SubmitButton>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </section>
  );
}
