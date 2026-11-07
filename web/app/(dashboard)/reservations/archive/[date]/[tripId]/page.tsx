import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Card, CardContent } from "@/components/ui/card";
import { listAllReservations } from "@/features/reservations/reservations.api";
import { formatArchiveDate, isValidDateOnly } from "@/lib/domain/dates";
import { isPopulated } from "@/lib/domain/types";
import { requireSession } from "@/lib/auth/session";

const ReservationsForTripArchivePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ date: string; tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  await requireSession();
  const [{ date, tripId }, query] = await Promise.all([params, searchParams]);
  const filters = {
    from: typeof query.from === "string" ? query.from : "",
    to: typeof query.to === "string" ? query.to : "",
  };
  if (
    (date !== "unknown" && !isValidDateOnly(date)) ||
    (tripId !== "unknown" && !/^[a-f\d]{24}$/i.test(tripId))
  ) {
    notFound();
  }

  const allReservations = await listAllReservations();
  const reservations = allReservations.filter((reservation) => {
    const trip = isPopulated(reservation.trip) ? reservation.trip : null;
    if (tripId === "unknown") return !trip;
    return (
      trip?._id === tripId &&
      date !== "unknown" &&
      trip.departureDate.slice(0, 10) === date &&
      (!filters.from || trip.from.toLowerCase().includes(filters.from.toLowerCase())) &&
      (!filters.to || trip.to.toLowerCase().includes(filters.to.toLowerCase()))
    );
  });
  const filterParams = new URLSearchParams();
  if (filters.from) filterParams.set("from", filters.from);
  if (filters.to) filterParams.set("to", filters.to);
  const filterQuery = filterParams.toString();
  const backHref = `/reservations/archive/${date}${filterQuery ? `?${filterQuery}` : ""}`;
  const trip = reservations[0] && isPopulated(reservations[0].trip)
    ? reservations[0].trip
    : null;

  return (
    <>
      <PageHeader
        title={trip ? `${trip.from} → ${trip.to}` : "Trip details unavailable"}
        description={`${date === "unknown" ? "Departure date unavailable" : formatArchiveDate(date)} · ${trip?.departureTime ?? ""} · ${reservations.length} passenger reservation(s)`}
        actions={
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={backHref}
          >
            Back to trips for this day
          </Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Reservation</th>
                  <th className="px-4 py-3 font-medium">Passenger</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Seat</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reservations.length ? reservations.map((reservation) => {
                  const seat = isPopulated(reservation.seat)
                    ? reservation.seat
                    : null;
                  return (
                    <tr key={reservation._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/reservations/${reservation._id}`}
                          className="hover:text-primary"
                        >
                          {reservation._id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{reservation.passengerName}</td>
                      <td className="px-4 py-3" dir="ltr">
                        {reservation.passengerPhone}
                      </td>
                      <td className="px-4 py-3">
                        {seat ? `Seat ${seat.seatNumber}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reservation.status} />
                      </td>
                      <td className="px-4 py-3">
                        {reservation.status === "CONFIRMED" && (
                          <ActionForm action="cancel-reservation">
                            <input
                              type="hidden"
                              name="id"
                              value={reservation._id}
                            />
                            <ConfirmSubmit
                              size="sm"
                              variant="destructive"
                              confirmation="Cancel this passenger's reservation?"
                            >
                              Cancel
                            </ConfirmSubmit>
                          </ActionForm>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-slate-500"
                      colSpan={6}
                    >
                      No reservations found for this trip.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ReservationsForTripArchivePage;
