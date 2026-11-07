import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/shared/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getTrip } from "@/features/trips/trips.api";
import { listBuses } from "@/features/buses/buses.api";
import { ApiError } from "@/lib/api/errors";
import { requireRole } from "@/lib/auth/session";
import { isPopulated } from "@/lib/domain/types";
import { SYRIAN_CITIES } from "@/features/trips/trips.constants";
import { getBusinessDate } from "@/lib/domain/dates";

const EditTripPage = async ({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) => {
  await requireRole(["ADMIN"]);
  const { tripId } = await params;
  const [trip, busResult] = await Promise.all([
    getTrip(tripId).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    listBuses({ isActive: "true", limit: 100 }),
  ]);
  if (trip.schedule?.isRecurring) redirect(`/schedules/${trip._id}`);
  const currentBus = isPopulated(trip.bus) ? trip.bus : null;
  const dateInput = trip.departureDate.slice(0, 10);

  return (
    <>
      <PageHeader title="Edit trip" description={`Update departure ${trip._id}.`} />
      <Card>
        <CardHeader><CardTitle>Trip details</CardTitle></CardHeader>
        <CardContent>
          <ActionForm action="update-trip" className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={trip._id} />
            <label className="space-y-2 text-sm font-medium text-slate-700">
              From
              <select name="from" required defaultValue={trip.from} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                {!SYRIAN_CITIES.includes(trip.from) && <option value={trip.from}>{trip.from}</option>}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              To
              <select name="to" required defaultValue={trip.to} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                {!SYRIAN_CITIES.includes(trip.to) && <option value={trip.to}>{trip.to}</option>}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Bus
              <select name="bus" required defaultValue={currentBus?._id ?? ""} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                {currentBus && !busResult.items.some((bus) => bus._id === currentBus._id) && (
                  <option value={currentBus._id}>{currentBus.busNumber} · {currentBus.busClass} (currently assigned)</option>
                )}
                {busResult.items.map((bus) => <option key={bus._id} value={bus._id}>{bus.busNumber} · {bus.busClass} · {bus.size}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Fare per seat (SYP)
              <Input name="price" type="number" min="0" step="1" defaultValue={trip.price} required />
              <span className="block text-xs font-normal text-slate-500">
                Full-capacity trip fare is calculated as fare per seat × bus capacity.
              </span>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Departure date
              <Input
                name="departureDate"
                type="date"
                min={dateInput < getBusinessDate() ? undefined : getBusinessDate()}
                defaultValue={dateInput}
                required
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Departure time
              <Input name="departureTime" type="time" defaultValue={trip.departureTime} required />
            </label>
            <div className="flex justify-end gap-3 pt-4 md:col-span-2">
              <Link href={`/trips/${trip._id}`}><Button type="button" variant="outline">Cancel</Button></Link>
              <SubmitButton>Save changes</SubmitButton>
            </div>
          </ActionForm>
        </CardContent>
      </Card>
    </>
  );
};

export default EditTripPage;
