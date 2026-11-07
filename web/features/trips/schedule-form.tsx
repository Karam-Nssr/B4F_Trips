"use client";

import { useState } from "react";

import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import type { Bus } from "@/lib/domain/types";
import { SYRIAN_CITIES } from "@/features/trips/trips.constants";
import type { ResourceAction } from "@/app/actions/resources";

type ScheduleFormProps = {
  action: ResourceAction;
  buses: Bus[];
  initial?: {
    _id: string;
    from: string;
    to: string;
    bus: string;
    price: number;
    departureTime: string;
    schedule: {
      frequency: "DAILY" | "WEEKLY" | "MONTHLY";
      startDate: string;
      endDate?: string | null;
      daysOfWeek?: number[];
      dayOfMonth?: number | null;
    };
  };
};

const weekdays = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const dateValue = (value: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export const ScheduleForm = ({ action, buses, initial }: ScheduleFormProps) => {
  const [frequency, setFrequency] = useState(initial?.schedule.frequency ?? "DAILY");
  return (
    <ActionForm action={action} className="grid gap-4 md:grid-cols-2">
      {initial && <input type="hidden" name="id" value={initial._id} />}
      <label className="space-y-2 text-sm font-medium text-slate-700">From
        <select name="from" required defaultValue={initial?.from ?? SYRIAN_CITIES[0]} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
          {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          {initial && !SYRIAN_CITIES.includes(initial.from) && <option value={initial.from}>{initial.from}</option>}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">To
        <select name="to" required defaultValue={initial?.to ?? SYRIAN_CITIES[1]} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
          {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
          {initial && !SYRIAN_CITIES.includes(initial.to) && <option value={initial.to}>{initial.to}</option>}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Active bus
        <select name="bus" required defaultValue={initial?.bus ?? ""} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
          <option value="">Select a bus</option>
          {buses.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber} · {bus.busClass} · {bus.size}</option>)}
          {initial?.bus && !buses.some((bus) => bus._id === initial.bus) && <option value={initial.bus}>Currently assigned bus</option>}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Fare per seat (SYP)
        <Input name="price" type="number" min="0" step="1" defaultValue={initial?.price} required />
        <span className="block text-xs font-normal text-slate-500">
          Full-capacity trip fare is calculated as fare per seat × bus capacity.
        </span>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Departure time
        <Input name="departureTime" type="time" defaultValue={initial?.departureTime} required />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Frequency
        <select name="frequency" value={frequency} onChange={(event) => setFrequency(event.target.value as typeof frequency)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
          <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option>
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">Start date
        <Input name="startDate" type="date" defaultValue={initial ? dateValue(initial.schedule.startDate) : undefined} required />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700">End date (optional)
        <Input name="endDate" type="date" defaultValue={initial?.schedule.endDate ? dateValue(initial.schedule.endDate) : undefined} />
      </label>
      {frequency === "WEEKLY" && (
        <fieldset className="space-y-2 md:col-span-2">
          <legend className="text-sm font-medium text-slate-700">Repeat on</legend>
          <div className="flex flex-wrap gap-4">
            {weekdays.map((day) => <label key={day.value} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="daysOfWeek" value={day.value} defaultChecked={initial?.schedule.daysOfWeek?.includes(day.value)} />
              {day.label}
            </label>)}
          </div>
        </fieldset>
      )}
      {frequency === "MONTHLY" && (
        <label className="space-y-2 text-sm font-medium text-slate-700">Day of month
          <Input name="dayOfMonth" type="number" min="1" max="31" defaultValue={initial?.schedule.dayOfMonth ?? undefined} required />
        </label>
      )}
      <p className="text-xs leading-5 text-slate-500 md:col-span-2">The backend generates upcoming departures within a rolling 30-day window.</p>
      <div className="flex justify-end gap-3 md:col-span-2"><SubmitButton>{initial ? "Save changes" : "Create schedule"}</SubmitButton></div>
    </ActionForm>
  );
};
