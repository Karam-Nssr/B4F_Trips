import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatMapPicker } from "@/features/seat-map/seat-map-picker";
import { buildSeatLayout } from "@/features/seat-map/lib/build-seat-layout";
import { getTrip, getTripSeats } from "@/features/trips/trips.api";
import { ApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session";
import { formatDate } from "@/lib/domain/types";

const TripBookingPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ booked?: string; failed?: string }>;
}) => {
  await requireSession();
  const [{ tripId }, result] = await Promise.all([params, searchParams]);
  const trip = await getTrip(tripId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });
  if (trip.schedule?.isRecurring) redirect(`/schedules/${trip._id}`);
  const data = await getTripSeats(tripId).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 400) {
      redirect(`/trips/${encodeURIComponent(tripId)}`);
    }
    throw error;
  });

  if (data.trip.status !== "SCHEDULED") redirect(`/trips/${encodeURIComponent(tripId)}`);

  const layout = buildSeatLayout(
    data.seats.map((seat) => ({
      id: seat.seatId,
      seatNumber: seat.seatNumber,
      row: seat.row,
      column: seat.column,
      position: seat.position,
      status: seat.status,
    })),
  );

  return (
    <>
      <PageHeader
        title="Reserve seats for passengers"
        description={`${data.trip.from} → ${data.trip.to} · ${formatDate(data.trip.departureDate)} · ${data.trip.departureTime}`}
      />
      {result.booked || result.failed ? (
        <div role="status" className={`mb-5 rounded-md border p-3 text-sm ${Number(result.failed) > 0 ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          <p>
            {result.booked ? `${result.booked} reservation(s) confirmed. ` : ""}
            {result.failed ? `${result.failed} seat(s) could not be reserved; the map has been refreshed.` : ""}
          </p>
          {Number(result.booked) > 0 && <Link className="mt-2 inline-block font-medium underline" href="/reservations">View reservations</Link>}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{data.bus.busNumber} · {data.bus.busClass}</CardTitle>
            <p className="text-sm text-slate-500">{data.availableSeats} available of {data.busCapacity}</p>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-slate-600">
              Select one or more seats and enter the passenger name and phone for each person. Reservations are recorded under your staff account.
            </p>
            <SeatMapPicker tripId={tripId} layout={layout} price={data.trip.price} />
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader><CardTitle>Departure details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">From</span><span className="font-medium">{data.trip.from}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">To</span><span className="font-medium">{data.trip.to}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Departure</span><span className="font-medium">{formatDate(data.trip.departureDate)} · {data.trip.departureTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Fare per seat</span><span className="font-medium">{data.trip.price.toLocaleString()} SYP</span></div>
            <p className="border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">
              A reservation is confirmed by the backend when the seat is available. If another staff member reserves it first, refresh and choose another seat.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TripBookingPage;
