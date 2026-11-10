"use client";

import { useState } from "react";
import Link from "next/link";

import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [daysOfWeek, setDaysOfWeek] = useState(initial?.schedule.daysOfWeek ?? []);
  return (
    <ActionForm action={action} className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(17rem,0.8fr)]">
      {initial && <input type="hidden" name="id" value={initial._id} />}
      <div className="space-y-5">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Route & departure</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Source city
              <select name="from" required defaultValue={initial?.from ?? SYRIAN_CITIES[0]} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                {initial && !SYRIAN_CITIES.includes(initial.from) && <option value={initial.from}>{initial.from}</option>}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Destination city
              <select name="to" required defaultValue={initial?.to ?? SYRIAN_CITIES[1]} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                {initial && !SYRIAN_CITIES.includes(initial.to) && <option value={initial.to}>{initial.to}</option>}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Active bus
              <select name="bus" required defaultValue={initial?.bus ?? ""} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                <option value="">Select a bus</option>
                {buses.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber} · {bus.busClass} · {bus.size}</option>)}
                {initial?.bus && !buses.some((bus) => bus._id === initial.bus) && <option value={initial.bus}>Currently assigned bus</option>}
              </select>
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Fare & date range</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Fare per seat (SYP)
              <Input name="price" type="number" min="0" step="1" defaultValue={initial?.price} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Departure time
              <Input name="departureTime" type="time" defaultValue={initial?.departureTime} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Starts on
              <Input name="startDate" type="date" defaultValue={initial ? dateValue(initial.schedule.startDate) : undefined} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Ends on (optional)
              <Input name="endDate" type="date" defaultValue={initial?.schedule.endDate ? dateValue(initial.schedule.endDate) : undefined} />
            </label>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recurring schedule</CardTitle>
            <p className="text-sm text-slate-500">Choose how often this departure repeats.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Frequency
              <select name="frequency" value={frequency} onChange={(event) => setFrequency(event.target.value as typeof frequency)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option>
              </select>
            </label>
            {frequency === "WEEKLY" && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-slate-700">Repeat on</legend>
                <div className="grid grid-cols-4 gap-2">
                  {weekdays.map((day) => <label key={day.value} className="flex cursor-pointer items-center justify-center rounded-md border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white">
                    <input
                      className="sr-only"
                      type="checkbox"
                      name="daysOfWeek"
                      value={day.value}
                      checked={daysOfWeek.includes(day.value)}
                      onChange={(event) => setDaysOfWeek((current) =>
                        event.target.checked
                          ? [...current, day.value]
                          : current.filter((value) => value !== day.value),
                      )}
                    />
                    {day.label.slice(0, 3)}
                  </label>)}
                </div>
              </fieldset>
            )}
            {frequency === "MONTHLY" && (
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                Day of month
                <Input name="dayOfMonth" type="number" min="1" max="31" defaultValue={initial?.schedule.dayOfMonth ?? undefined} required />
              </label>
            )}
            <div className="rounded-lg bg-blue-50 p-4 text-sm leading-5 text-blue-800">
              Upcoming departures are generated by the backend within a rolling
              30-day window.
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 lg:col-span-2">
        <Link href={initial ? `/schedules/${initial._id}` : "/schedules"}>
          <Button type="button" variant="outline">Discard</Button>
        </Link>
        <SubmitButton>{initial ? "Save changes" : "Create schedule"}</SubmitButton>
      </div>
    </ActionForm>
  );
};
