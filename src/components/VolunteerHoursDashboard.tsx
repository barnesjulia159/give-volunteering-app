"use client";

import { useEffect, useState } from "react";

type HoursEntry = {
  id: string;
  opportunityTitle: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  recordedAt: string;
  hours: number;
  status: string;
  source: "attendance" | "manual";
  notes: string | null;
};

type HoursResponse = { data: HoursEntry[]; totalHours: number };

export function VolunteerHoursDashboard() {
  const [result, setResult] = useState<HoursResponse>({ data: [], totalHours: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance/hours", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { data: [], totalHours: 0 }))
      .then((data) => setResult(data))
      .finally(() => setIsLoading(false));
  }, []);

  const byOpportunity = result.data.reduce<Record<string, number>>((totals, entry) => {
    totals[entry.opportunityTitle] = (totals[entry.opportunityTitle] ?? 0) + entry.hours;
    return totals;
  }, {});

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-5">
          <p className="text-sm font-medium text-emerald-800">Total hours</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{result.totalHours.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-5">
          <p className="text-sm font-medium text-slate-600">Completed sessions</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{result.data.filter((entry) => entry.hours > 0).length}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-5">
          <p className="text-sm font-medium text-amber-800">In progress</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{result.data.filter((entry) => entry.checkInAt && !entry.checkOutAt).length}</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold">Hours by opportunity</h2>
        {Object.keys(byOpportunity).length === 0 ? (
          <p className="mt-3 rounded-xl bg-white p-5 text-slate-600">No logged hours yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b text-slate-500"><th className="px-5 py-3">Opportunity</th><th className="px-5 py-3">Hours</th></tr></thead>
              <tbody>{Object.entries(byOpportunity).map(([title, hours]) => <tr key={title} className="border-b"><td className="px-5 py-3 font-medium">{title}</td><td className="px-5 py-3">{hours.toFixed(2)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold">Attendance history</h2>
        {isLoading ? <p className="mt-3 text-slate-500">Loading attendance...</p> : result.data.length === 0 ? <p className="mt-3 rounded-xl bg-white p-5 text-slate-600">Your check-in history will appear here.</p> : (
          <div className="mt-3 space-y-3">{result.data.map((entry) => <article key={entry.id} className="rounded-xl bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{entry.opportunityTitle}</h3><p className="text-xs capitalize text-slate-500">{entry.source} hours</p></div><span className="font-medium text-emerald-700">{entry.hours.toFixed(2)} hours</span></div>{entry.source === "attendance" ? <><p className="mt-2 text-sm text-slate-600">Checked in: {entry.checkInAt ? new Date(entry.checkInAt).toLocaleString() : "Not checked in"}</p><p className="text-sm text-slate-600">Checked out: {entry.checkOutAt ? new Date(entry.checkOutAt).toLocaleString() : "Not checked out"}</p></> : <p className="mt-2 text-sm text-slate-600">Recorded: {new Date(entry.recordedAt).toLocaleString()}</p>}{entry.notes && <p className="mt-2 text-sm text-slate-600">Note: {entry.notes}</p>}</article>)}</div>
        )}
      </section>
    </div>
  );
}
