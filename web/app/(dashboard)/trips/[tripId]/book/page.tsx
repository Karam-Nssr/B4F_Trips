import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
        title="Book passenger seats"
        description="1. Trip & seat  /  2. Passenger details  /  3. Confirm reservation"
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
      <Card className="mb-5">
        <CardContent className="grid gap-4 p-4 md:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] md:items-center">
          <span className="inline-flex w-fit rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
            {data.bus.busNumber}
          </span>
          <div>
            <h2 className="text-lg font-medium text-slate-900">
              {data.trip.from} <span aria-hidden="true">→</span> {data.trip.to}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(data.trip.departureDate)}
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-800">{data.trip.departureTime}</p>
            <p className="mt-1 text-slate-500">
              {data.availableSeats} of {data.busCapacity} seats available
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-800">{data.bus.busClass}</p>
            <p className="mt-1 text-primary">
              {data.trip.price.toLocaleString()} SYP / seat
            </p>
          </div>
          <Link
            href="/trips"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Change trip
          </Link>
        </CardContent>
      </Card>
      <p className="mb-4 text-sm text-slate-500">
        Select one or more seats and enter each passenger’s details. The backend
        confirms each reservation against live seat availability.
      </p>
      <SeatMapPicker tripId={tripId} layout={layout} price={data.trip.price} />
    </>
  );
};

export default TripBookingPage;
