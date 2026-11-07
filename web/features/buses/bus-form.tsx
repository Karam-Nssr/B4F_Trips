"use client";

import { useState } from "react";

import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { BUS_CONFIGS } from "@/features/trips/trips.constants";
import type { ResourceAction } from "@/app/actions/resources";

type BusFormProps = {
  action: ResourceAction;
  initial?: {
    _id: string;
    busNumber: string;
    busClass: string;
    size: string;
  };
};

export const BusForm = ({ action, initial }: BusFormProps) => {
  const [busClass, setBusClass] = useState(initial?.busClass ?? "ORDINARY");
  const [size, setSize] = useState(initial?.size ?? "LARGE");
  const capacity = BUS_CONFIGS.find((config) => config.busClass === busClass && config.size === size)?.capacity ?? 0;
  return (
    <ActionForm action={action} className="grid gap-4 md:grid-cols-2">
      {initial && <input type="hidden" name="id" value={initial._id} />}
      <label className="space-y-2 text-sm font-medium text-slate-700">
        Bus number
        <Input name="busNumber" defaultValue={initial?.busNumber} required />
      </label>
      {initial ? (
        <>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Bus class
            <Input value={busClass.replace("_", " ")} readOnly aria-readonly="true" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Size
            <Input value={size} readOnly aria-readonly="true" />
          </label>
          <p className="text-xs leading-5 text-slate-500 md:col-span-2">
            Class and size cannot be changed here because the backend may not
            rebuild seats and capacity consistently for every bus history.
          </p>
        </>
      ) : (
        <>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Bus class
            <select name="busClass" value={busClass} onChange={(event) => setBusClass(event.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
              <option value="ORDINARY">Ordinary</option>
              <option value="FIRST_CLASS">First class</option>
              <option value="BUSINESS">Business</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            Size
            <select name="size" value={size} onChange={(event) => setSize(event.target.value)} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
              <option value="LARGE">Large</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </label>
        </>
      )}
      <label className="space-y-2 text-sm font-medium text-slate-700">
        Capacity
        <Input value={capacity} readOnly aria-readonly="true" />
      </label>
      <div className="flex justify-end gap-3 pt-3 md:col-span-2">
        <SubmitButton>{initial ? "Save changes" : "Create bus"}</SubmitButton>
      </div>
    </ActionForm>
  );
};
