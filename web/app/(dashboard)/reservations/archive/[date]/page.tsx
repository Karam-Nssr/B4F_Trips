import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { listAllReservations } from "@/features/reservations/reservations.api";
import { formatArchiveDate, isValidDateOnly } from "@/lib/domain/dates";
import type { Reservation } from "@/lib/domain/types";
import { isPopulated } from "@/lib/domain/types";
import { requireSession } from "@/lib/auth/session";

const ReservationArchiveDayPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  await requireSession();
  const [{ date }, query] = await Promise.all([params, searchParams]);
  const filters = {
    from: typeof query.from === "string" ? query.from : "",
    to: typeof query.to === "string" ? query.to : "",
  };
  if (date !== "unknown" && !isValidDateOnly(date)) notFound();

  const allReservations = await listAllReservations();
  const reservations = allReservations.filter((reservation) => {
    const trip = isPopulated(reservation.trip) ? reservation.trip : null;
    if (!trip) return date === "unknown" && !filters.from && !filters.to;
    return (
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
  const detailHref = (tripId: string) =>
    `/reservations/archive/${date}/${tripId}${filterQuery ? `?${filterQuery}` : ""}`;
  const backHref = `/reservations${date === "unknown" ? "" : `?departureDate=${date}`}${filterQuery ? `${date === "unknown" ? "?" : "&"}${filterQuery}` : ""}`;
  const tripGroups = new Map<string, {
    trip: Extract<Reservation["trip"], { _id: string }> | null;
    total: number;
    confirmed: number;
    cancelled: number;
  }>();
  for (const reservation of reservations) {
    const trip = isPopulated(reservation.trip) ? reservation.trip : null;
    const tripKey = trip?._id ?? "unknown";
    const group = tripGroups.get(tripKey) ?? {
      trip,
      total: 0,
      confirmed: 0,
      cancelled: 0,
    };
    group.total++;
    if (reservation.status === "CONFIRMED") group.confirmed++;
    else group.cancelled++;
    tripGroups.set(tripKey, group);
  }
  const groups = [...tripGroups.entries()].sort(([, first], [, second]) =>
    (first?.trip?.departureTime ?? "").localeCompare(
      second?.trip?.departureTime ?? "",
    ),
  );

  return (
    <>
      <PageHeader
        title={`Reservations · ${date === "unknown" ? "Date unavailable" : formatArchiveDate(date)}`}
        description={`${groups.length} trip(s) · ${reservations.length} reservation(s) for this departure day.`}
        actions={
          <Link className="text-sm font-medium text-primary hover:underline" href={backHref}>
            Back to reservation archives
          </Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Trip</th>
                  <th className="px-4 py-3 font-medium">Departure</th>
                  <th className="px-4 py-3 font-medium">Reservations</th>
                  <th className="px-4 py-3 font-medium">Confirmed</th>
                  <th className="px-4 py-3 font-medium">Cancelled</th>
                  <th className="px-4 py-3 font-medium">Open archive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {groups.length ? groups.map(([tripId, group]) => {
                  const targetTripId = tripId === "unknown" ? "unknown" : tripId;
                  return (
                    <tr key={tripId} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {group.trip ? (
                          <Link href={`/trips/${group.trip._id}`} className="font-medium text-slate-900 hover:text-primary">
                            {group.trip.from} → {group.trip.to}
                          </Link>
                        ) : (
                          <span className="font-medium">Trip details unavailable</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{group.trip?.departureTime ?? "—"}</td>
                      <td className="px-4 py-3">{group.total}</td>
                      <td className="px-4 py-3">{group.confirmed}</td>
                      <td className="px-4 py-3">{group.cancelled}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={detailHref(targetTripId)}
                          className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
                        >
                          View passengers
                        </Link>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>No reservations found for this day.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ReservationArchiveDayPage;
