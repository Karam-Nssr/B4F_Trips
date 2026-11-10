import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
      <PageHeader
        title="Edit trip & departure"
        description={`${trip.from} → ${trip.to} · Changes apply to this departure only.`}
        actions={<StatusBadge status={trip.status} />}
      />
      <ActionForm
        action="update-trip"
        className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]"
      >
        <input type="hidden" name="id" value={trip._id} />
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Route & departure</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Source city
                <select name="from" required defaultValue={trip.from} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                  {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  {!SYRIAN_CITIES.includes(trip.from) && <option value={trip.from}>{trip.from}</option>}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Destination city
                <select name="to" required defaultValue={trip.to} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900">
                  {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  {!SYRIAN_CITIES.includes(trip.to) && <option value={trip.to}>{trip.to}</option>}
                </select>
              </label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Time, bus & fare</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
              </label>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader><CardTitle className="text-base">Departure details</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500">Trip reference</p>
              <p className="mt-1 break-all font-medium text-slate-900">{trip._id}</p>
            </div>
            <div>
              <p className="text-slate-500">Assigned bus</p>
              <p className="mt-1 font-medium text-slate-900">
                {currentBus ? `${currentBus.busNumber} · ${currentBus.capacity} seats` : "Bus reference unavailable"}
              </p>
            </div>
            <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
              Recurring departures are managed through their schedule. Existing
              reservations keep their seat assignments.
            </p>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4 lg:col-span-2">
          <Link href={`/trips/${trip._id}`}><Button type="button" variant="outline">Discard</Button></Link>
          <SubmitButton>Save changes</SubmitButton>
        </div>
      </ActionForm>
    </>
  );
};

export default EditTripPage;
