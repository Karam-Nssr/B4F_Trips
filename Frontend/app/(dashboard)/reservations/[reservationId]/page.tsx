import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReservation } from "@/features/reservations/reservations.api";
import { ApiError } from "@/lib/api/errors";
import { requireSession } from "@/lib/auth/session";
import { formatDate, isPopulated } from "@/lib/domain/types";

const ReservationDetailPage = async ({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) => {
  await requireSession();
  const { reservationId } = await params;
  const reservation = await getReservation(reservationId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    },
  );
  const trip = isPopulated(reservation.trip) ? reservation.trip : null;
  const seat = isPopulated(reservation.seat) ? reservation.seat : null;
  const creator =
    reservation.createdBy &&
    typeof reservation.createdBy === "object" &&
    "name" in reservation.createdBy
      ? reservation.createdBy.name
      : null;

  return (
    <>
      <PageHeader title={reservation.status === "CONFIRMED" ? "Reservation confirmed" : "Reservation cancelled"} description="Passenger, trip, and seat details for this reservation." actions={
        reservation.status === "CONFIRMED" ? <ActionForm action="cancel-reservation">
          <input type="hidden" name="id" value={reservation._id} />
          <ConfirmSubmit variant="destructive" confirmation="Cancel this confirmed reservation?">Cancel reservation</ConfirmSubmit>
        </ActionForm> : undefined
      } />
      <div className={`mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4 ${reservation.status === "CONFIRMED" ? "border-emerald-100 bg-emerald-50" : "border-red-100 bg-red-50"}`}>
        <div>
          <p className={`font-semibold ${reservation.status === "CONFIRMED" ? "text-emerald-800" : "text-red-800"}`}>
            {reservation.passengerName}’s seat is {reservation.status === "CONFIRMED" ? "reserved" : "cancelled"}.
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {reservation._id}{creator ? ` · Created by ${creator}` : ""}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.9fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader><CardTitle>Journey & passenger</CardTitle></CardHeader>
            <CardContent>
              {trip ? (
                <Link className="text-xl font-medium text-slate-900 hover:text-primary" href={`/trips/${trip._id}`}>
                  {trip.from} <span aria-hidden="true">→</span> {trip.to}
                </Link>
              ) : (
                <p className="text-xl font-medium text-slate-900">Trip details unavailable</p>
              )}
              <p className="mt-2 text-sm text-slate-500">
                {trip ? `${formatDate(trip.departureDate)} · ${trip.departureTime}` : "Departure unavailable"}
              </p>
              <div className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Passenger</p>
                  <p className="mt-1 font-semibold text-slate-900">{reservation.passengerName}</p>
                  <p className="mt-1 text-sm text-slate-500" dir="ltr">{reservation.passengerPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Seat</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {seat && "seatNumber" in seat ? `Seat ${seat.seatNumber}` : "Seat details unavailable"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {seat && "row" in seat ? `Row ${seat.row}` : ""}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="h-fit">
          <CardHeader><CardTitle>Reservation reference</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Reference</p>
              <p className="mt-2 break-all text-lg font-medium text-slate-900">{reservation._id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Fare per seat</p>
              <p className="mt-1 text-xl font-medium text-slate-900">
                {trip ? `${trip.price.toLocaleString()} SYP` : "Unavailable"}
              </p>
            </div>
            <p className="border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
              Reservation status and seat assignment are provided by the trip
              service. Payment and ticket issuance are not available in this portal.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ReservationDetailPage;
