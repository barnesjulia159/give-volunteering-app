 "use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SKILLS = [
  "Administration",
  "Community outreach",
  "Event planning",
  "First aid",
  "Fundraising",
  "Graphic design",
  "Leadership",
  "Marketing",
  "Mentoring",
  "Photography",
  "Project management",
  "Public speaking",
  "Social media",
  "Teaching",
  "Translation",
  "Web development",
];

const CAUSES = [
  "Animal welfare",
  "Arts and culture",
  "Children and youth",
  "Community development",
  "Disaster relief",
  "Education",
  "Environment",
  "Food security",
  "Health and wellbeing",
  "Homelessness",
  "Human rights",
  "Mental health",
  "Older adults",
  "Poverty reduction",
  "Refugee support",
  "Women and girls",
];

type VolunteerPreferences = {
  skills: string[];
  causes: string[];
};

export default function VolunteerSkillsAndCausesPage() {
  const router = useRouter();

  const [skills, setSkills] = useState<string[]>([]);
  const [causes, setCauses] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [customCause, setCustomCause] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadPreferences() {
      try {
        setError("");
        const response = await fetch(`/api/volunteer/profile/skills-causes`);
        if (!response.ok) throw new Error("Unable to load skills and causes.");
        const data: VolunteerPreferences = await response.json();
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setCauses(Array.isArray(data.causes) ? data.causes : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, []);

  function toggleSelection(
    value: string,
    selected: string[],
    update: (v: string[]) => void
  ) {
    update(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  function addCustom(
    value: string,
    selected: string[],
    update: (v: string[]) => void,
    clear: () => void
  ) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!selected.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      update([...selected, trimmed]);
    }
    clear();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setError("");
      setSuccessMessage("");
      setIsSaving(true);
      const response = await fetch(`/api/volunteer/profile/skills-causes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills, causes }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? "Unable to save skills and causes.");
      }
      setSuccessMessage("Your skills and causes have been updated.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-sm text-slate-600">Loading skills and causes...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <Link
          href="/volunteer/profile"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
        >
          ← Back to profile
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Skills &amp; Causes
        </h1>
        <p className="mt-2 text-slate-600">
          Select the skills you can offer and the causes you care about.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        {successMessage && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {successMessage}
          </div>
        )}

        <SelectionSection
          title="Your skills"
          description="Choose everything you feel comfortable helping with."
          options={SKILLS}
          selectedValues={skills}
          customValue={customSkill}
          customPlaceholder="Add another skill"
          onCustomValueChange={setCustomSkill}
          onToggle={(s) => toggleSelection(s, skills, setSkills)}
          onAddCustom={() =>
            addCustom(customSkill, skills, setSkills, () => setCustomSkill(""))
          }
          onRemoveCustom={(s) =>
            setSkills((cur) => cur.filter((v) => v !== s))
          }
        />

        <SelectionSection
          title="Causes you care about"
          description="Choose the causes that are most meaningful to you."
          options={CAUSES}
          selectedValues={causes}
          customValue={customCause}
          customPlaceholder="Add another cause"
          onCustomValueChange={setCustomCause}
          onToggle={(c) => toggleSelection(c, causes, setCauses)}
          onAddCustom={() =>
            addCustom(customCause, causes, setCauses, () => setCustomCause(""))
          }
          onRemoveCustom={(c) =>
            setCauses((cur) => cur.filter((v) => v !== c))
          }
        />

        <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:justify-end">
          <Link
            href="/volunteer/profile"
            className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || skills.length === 0 || causes.length === 0}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </main>
  );
}

type SelectionSectionProps = {
  title: string;
  description: string;
  options: string[];
  selectedValues: string[];
  customValue: string;
  customPlaceholder: string;
  onCustomValueChange: (value: string) => void;
  onToggle: (value: string) => void;
  onAddCustom: () => void;
  onRemoveCustom: (value: string) => void;
};

function SelectionSection({
  title,
  description,
  options,
  selectedValues,
  customValue,
  customPlaceholder,
  onCustomValueChange,
  onToggle,
  onAddCustom,
  onRemoveCustom,
}: SelectionSectionProps) {
  const customValues = selectedValues.filter((v) => !options.includes(v));

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option);
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(option)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-800">
                {option}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddCustom();
            }
          }}
          placeholder={customPlaceholder}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
        <button
          type="button"
          onClick={onAddCustom}
          disabled={!customValue.trim()}
          className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {customValues.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {customValues.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onRemoveCustom(value)}
              aria-label={`Remove ${value}`}
              className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 hover:bg-emerald-200"
            >
              {value} ×
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
