import Link from "next/link";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/submit-button";
import { listBuses } from "@/features/buses/buses.api";
import { requireRole } from "@/lib/auth/session";
import { SYRIAN_CITIES } from "@/features/trips/trips.constants";
import { getBusinessDate } from "@/lib/domain/dates";

const NewTripPage = async () => {
  await requireRole(["ADMIN"]);
  const { items: buses } = await listBuses({ isActive: "true", limit: 100 });

  return (
    <>
      <PageHeader title="Create trip" description="Add a departure and assign an active bus." />
      <Card>
        <CardHeader><CardTitle>Trip details</CardTitle></CardHeader>
        <CardContent>
          <ActionForm action="create-trip" className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              From
              <select name="from" required className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              To
              <select name="to" required defaultValue={SYRIAN_CITIES[1]} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Bus
              <select name="bus" required className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                <option value="">Select an active bus</option>
                {buses.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber} · {bus.busClass} · {bus.size} ({bus.capacity} seats)</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Fare per seat (SYP)
              <Input name="price" type="number" min="1" step="1" required />
              <span className="block text-xs font-normal text-slate-500">
                Full-capacity trip fare is calculated as fare per seat × bus capacity.
              </span>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Departure date
              <Input name="departureDate" type="date" min={getBusinessDate()} required />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Departure time
              <Input name="departureTime" type="time" required />
            </label>
            <div className="flex justify-end gap-3 pt-4 md:col-span-2">
              <Link href="/trips"><Button type="button" variant="outline">Cancel</Button></Link>
              <SubmitButton>Create trip</SubmitButton>
            </div>
          </ActionForm>
        </CardContent>
      </Card>
    </>
  );
};

export default NewTripPage;
