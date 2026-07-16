import Link from "next/link";

export default function NotFound() {
  return (
    <section className="rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-slate-700">
        The page you are looking for does not exist or is no longer available.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
      >
        Return Home
      </Link>
    </section>
  );
}
