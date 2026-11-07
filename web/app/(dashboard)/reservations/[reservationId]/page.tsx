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

  return (
    <>
      <PageHeader title="Reservation details" description={`Reservation ${reservation._id}`} actions={
        reservation.status === "CONFIRMED" ? <ActionForm action="cancel-reservation">
          <input type="hidden" name="id" value={reservation._id} />
          <ConfirmSubmit variant="destructive" confirmation="Cancel this confirmed reservation?">Cancel reservation</ConfirmSubmit>
        </ActionForm> : undefined
      } />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Passenger</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
          <div><p className="text-slate-500">Name</p><p className="font-medium">{reservation.passengerName}</p></div>
          <div><p className="text-slate-500">Phone</p><p className="font-medium" dir="ltr">{reservation.passengerPhone}</p></div>
          <div><p className="text-slate-500">Status</p><StatusBadge status={reservation.status} /></div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Trip and seat</CardTitle></CardHeader><CardContent className="space-y-4 text-sm">
          <div><p className="text-slate-500">Route</p>{trip ? <Link className="font-medium text-primary hover:underline" href={`/trips/${trip._id}`}>{trip.from} → {trip.to}</Link> : <p>Trip details unavailable</p>}</div>
          <div><p className="text-slate-500">Departure</p><p className="font-medium">{trip ? `${formatDate(trip.departureDate)} · ${trip.departureTime}` : "—"}</p></div>
          <div><p className="text-slate-500">Seat</p><p className="font-medium">{seat && "seatNumber" in seat ? `Seat ${seat.seatNumber}${"row" in seat ? ` · Row ${seat.row}` : ""}` : "—"}</p></div>
          <div><p className="text-slate-500">Fare per seat</p><p className="font-medium">{trip?.price.toLocaleString() ?? "—"}{trip ? " SYP" : ""}</p></div>
        </CardContent></Card>
      </div>
    </>
  );
};

export default ReservationDetailPage;
