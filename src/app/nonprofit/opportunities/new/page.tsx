import { RoleGate } from "@/components/RoleGate";
import { SubmitButton } from "@/components/SubmitButton";
import { createOpportunity } from "@/lib/actions/opportunities";

type NewOpportunityPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewOpportunityPage({
  searchParams,
}: NewOpportunityPageProps) {
  const params = await searchParams;

  return (
    <RoleGate allowedRoles={["nonprofit"]}>
      <section className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Create Volunteer Opportunity</h1>
        <p className="mt-2 text-slate-700">
          Add the details volunteers need to decide whether this opportunity is
          a good fit.
        </p>

        {params.error && <p className="alert-error mt-4">{params.error}</p>}

        <OpportunityForm action={createOpportunity} />
      </section>
    </RoleGate>
  );
}

function OpportunityForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="form-field">
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input id="title" name="title" required className="form-input" />
      </div>

      <div className="form-field">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          className="form-input min-h-32"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-field">
          <label htmlFor="start_at" className="form-label">
            Start Date and Time
          </label>
          <input
            id="start_at"
            name="start_at"
            type="datetime-local"
            required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="end_at" className="form-label">
            End Date and Time
          </label>
          <input
            id="end_at"
            name="end_at"
            type="datetime-local"
            required
            className="form-input"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-field">
          <label htmlFor="capacity" className="form-label">
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="minimum_age" className="form-label">
            Minimum Age
          </label>
          <input
            id="minimum_age"
            name="minimum_age"
            type="number"
            min="0"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="location_name" className="form-label">
          Location Name
        </label>
        <input id="location_name" name="location_name" className="form-input" />
      </div>

      <div className="form-field">
        <label htmlFor="address_line1" className="form-label">
          Address Line 1
        </label>
        <input id="address_line1" name="address_line1" className="form-input" />
      </div>

      <div className="form-field">
        <label htmlFor="address_line2" className="form-label">
          Address Line 2
        </label>
        <input id="address_line2" name="address_line2" className="form-input" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="form-field">
          <label htmlFor="city" className="form-label">
            City
          </label>
          <input id="city" name="city" className="form-input" />
        </div>

        <div className="form-field">
          <label htmlFor="state" className="form-label">
            State
          </label>
          <input id="state" name="state" className="form-input" />
        </div>

        <div className="form-field">
          <label htmlFor="zip_code" className="form-label">
            ZIP Code
          </label>
          <input id="zip_code" name="zip_code" className="form-input" />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="requirements" className="form-label">
          Requirements
        </label>
        <textarea
          id="requirements"
          name="requirements"
          className="form-input min-h-24"
        />
      </div>

      <div className="form-field">
        <label htmlFor="accessibility_notes" className="form-label">
          Accessibility Notes
        </label>
        <textarea
          id="accessibility_notes"
          name="accessibility_notes"
          className="form-input min-h-24"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <SubmitButton
          name="submit_action"
          value="draft"
          className="bg-slate-700 hover:bg-slate-800"
        >
          Save Draft
        </SubmitButton>

        <SubmitButton name="submit_action" value="publish">
          Publish
        </SubmitButton>
      </div>
    </form>
  );
}
