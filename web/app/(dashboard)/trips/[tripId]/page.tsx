import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrip, getTripSeats } from "@/features/trips/trips.api";
import { ApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session";
import { formatDate, isPopulated } from "@/lib/domain/types";

const TripDetailPage = async ({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) => {
  const [user, { tripId }] = await Promise.all([requireSession(), params]);
  const trip = await getTrip(tripId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    },
  );
  const seatSummary =
    trip.status === "CANCELLED" || trip.schedule?.isRecurring
      ? null
      : await getTripSeats(tripId);
  const bus = isPopulated(trip.bus) ? trip.bus : null;
  const capacity = bus?.capacity ?? seatSummary?.busCapacity;
  const fullCapacityFare =
    capacity === undefined ? null : trip.price * capacity;
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <PageHeader
        title={`${trip.from} → ${trip.to}`}
        description={`Departure ${formatDate(trip.departureDate)} at ${trip.departureTime}`}
        actions={
          <div className="flex flex-wrap gap-2">
            {trip.status === "SCHEDULED" && !trip.schedule?.isRecurring && (
              <Link href={`/trips/${trip._id}/book`}><Button>Reserve seats for passengers</Button></Link>
            )}
            {isAdmin && trip.schedule?.isRecurring && (
              <Link href={`/schedules/${trip._id}`}><Button variant="outline">Manage schedule</Button></Link>
            )}
            {isAdmin && !trip.schedule?.isRecurring && (
              <>
                <Link href={`/trips/${trip._id}/edit`}><Button variant="outline">Edit</Button></Link>
                {trip.status === "SCHEDULED" && (
                  <ActionForm action="cancel-trip">
                    <input type="hidden" name="id" value={trip._id} />
                    <ConfirmSubmit variant="outline" confirmation="Cancel this trip?">Cancel trip</ConfirmSubmit>
                  </ActionForm>
                )}
                <ActionForm action="delete-trip">
                  <input type="hidden" name="id" value={trip._id} />
                  <ConfirmSubmit variant="destructive" confirmation="Permanently delete this trip? Trips with reservations cannot be deleted.">
                    Delete trip
                  </ConfirmSubmit>
                </ActionForm>
              </>
            )}
          </div>
        }
      />
      {trip.schedule?.isRecurring && (
        <p role="status" className="mb-5 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          This is a recurring schedule template, not a bookable departure.
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Trip overview</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-5 text-sm">
            <div><p className="text-slate-500">Trip ID</p><p className="break-all font-medium">{trip._id}</p></div>
            <div><p className="text-slate-500">Status</p><StatusBadge status={trip.status} /></div>
            <div><p className="text-slate-500">Departure</p><p className="font-medium">{formatDate(trip.departureDate)} · {trip.departureTime}</p></div>
            <div><p className="text-slate-500">Fare per seat</p><p className="font-medium">{trip.price} SYP</p></div>
            <div><p className="text-slate-500">Bus</p><p className="font-medium">{bus ? `${bus.busNumber} · ${bus.busClass} · ${bus.size}` : "Bus reference unavailable"}</p></div>
            <div><p className="text-slate-500">Capacity</p><p className="font-medium">{capacity ?? "—"}</p></div>
            <div>
              <p className="text-slate-500">Potential full-capacity fare</p>
              <p className="font-medium">{fullCapacityFare === null ? "—" : `${fullCapacityFare.toLocaleString()} SYP`}</p>
              <p className="text-xs text-slate-500">Fare per seat × bus capacity; not actual collected revenue.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Seat availability</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {seatSummary ? (
              <>
                <div className="flex justify-between"><span className="text-slate-600">Available</span><span className="font-medium">{seatSummary.availableSeats}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Reserved</span><span className="font-medium">{seatSummary.reservedSeats}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Capacity</span><span className="font-medium">{seatSummary.busCapacity}</span></div>
              </>
            ) : (
              <p className="text-slate-600">{trip.status === "CANCELLED" ? "Seat availability is unavailable for cancelled trips." : "Availability does not apply to a schedule template."}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TripDetailPage;
