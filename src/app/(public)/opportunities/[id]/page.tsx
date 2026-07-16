import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicOpportunityListing } from "@/lib/types";

type OpportunityDetailsPageProps = {
	params: Promise<{
		id: string;
	}>;
};

export default async function OpportunityDetailsPage({
	params,
}: OpportunityDetailsPageProps) {
	const { id } = await params;
	const supabase = await createClient();

	const { data } = await supabase
		.from("public_opportunity_listings")
		.select("*")
		.eq("id", id)
		.maybeSingle();

	if (!data) {
		notFound();
	}

	const opportunity = data as PublicOpportunityListing;
	const startDate = new Date(opportunity.start_at);
	const endDate = new Date(opportunity.end_at);

	return (
		<section className="mx-auto max-w-4xl space-y-6">
			<Link
				href="/opportunities"
				className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
			>
				Back to opportunities
			</Link>

			<div className="rounded-2xl bg-white p-6 shadow-sm">
				<p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
					{opportunity.organization_name}
				</p>

				<h1 className="mt-2 text-4xl font-bold text-slate-950">
					{opportunity.title}
				</h1>

				<p className="mt-4 text-base leading-7 text-slate-700">
					{opportunity.description}
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
				<div className="rounded-2xl bg-white p-6 shadow-sm">
					<h2 className="text-2xl font-semibold text-slate-950">Details</h2>

					<dl className="mt-5 space-y-4 text-slate-700">
						<div>
							<dt className="text-sm font-medium text-slate-500">Date</dt>
							<dd>
								{startDate.toLocaleDateString()} from {startDate.toLocaleTimeString()} to{" "}
								{endDate.toLocaleTimeString()}
							</dd>
						</div>

						<div>
							<dt className="text-sm font-medium text-slate-500">Location</dt>
							<dd>
								{opportunity.is_virtual
									? "Virtual"
									: [
											opportunity.location_name,
											[opportunity.city, opportunity.state]
												.filter(Boolean)
												.join(", "),
										]
											.filter(Boolean)
											.join(" - ") || "Location TBD"}
							</dd>
						</div>

						<div>
							<dt className="text-sm font-medium text-slate-500">Capacity</dt>
							<dd>
								{opportunity.spots_remaining} spots remaining out of {opportunity.capacity}
							</dd>
						</div>

						{opportunity.minimum_age !== null && (
							<div>
								<dt className="text-sm font-medium text-slate-500">Minimum age</dt>
								<dd>{opportunity.minimum_age}+</dd>
							</div>
						)}

						{opportunity.requirements && (
							<div>
								<dt className="text-sm font-medium text-slate-500">Requirements</dt>
								<dd>{opportunity.requirements}</dd>
							</div>
						)}

						{opportunity.accessibility_notes && (
							<div>
								<dt className="text-sm font-medium text-slate-500">
									Accessibility notes
								</dt>
								<dd>{opportunity.accessibility_notes}</dd>
							</div>
						)}
					</dl>
				</div>

				<aside className="rounded-2xl bg-white p-6 shadow-sm">
					<h2 className="text-2xl font-semibold text-slate-950">Ready to help?</h2>

					<p className="mt-3 text-slate-700">
						Create an account or sign in to book this opportunity and manage your
						volunteer schedule.
					</p>

					<div className="mt-6 flex flex-col gap-3">
						<Link
							href="/register"
							className="rounded-md bg-emerald-700 px-4 py-3 text-center font-medium text-white hover:bg-emerald-800"
						>
							Create account
						</Link>

						<Link
							href="/login"
							className="rounded-md border border-slate-300 px-4 py-3 text-center font-medium text-slate-800 hover:bg-slate-100"
						>
							Sign in
						</Link>
					</div>
				</aside>
			</div>
		</section>
	);
}
