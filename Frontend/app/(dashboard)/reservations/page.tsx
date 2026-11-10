import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { listAllReservations } from "@/features/reservations/reservations.api";
import { isPopulated } from "@/lib/domain/types";
import { requireSession } from "@/lib/auth/session";
import { formatArchiveDate, getDateKey } from "@/lib/domain/dates";
import { SYRIAN_CITIES } from "@/features/trips/trips.constants";
import { Button } from "@/components/ui/button";

const ReservationsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const user = await requireSession();
  const query = await searchParams;
  const filters = {
    departureDate: typeof query.departureDate === "string" ? query.departureDate : "",
    from: typeof query.from === "string" ? query.from : "",
    to: typeof query.to === "string" ? query.to : "",
  };
  const reservations = (await listAllReservations()).filter(
    (reservation) => {
      const trip = isPopulated(reservation.trip) ? reservation.trip : null;
      if (!trip) return !filters.departureDate && !filters.from && !filters.to;
      return (
        (!filters.departureDate || getDateKey(trip.departureDate) === filters.departureDate) &&
        (!filters.from || trip.from.toLowerCase().includes(filters.from.toLowerCase())) &&
        (!filters.to || trip.to.toLowerCase().includes(filters.to.toLowerCase()))
      );
    },
  );
  const routeParams = new URLSearchParams();
  if (filters.from) routeParams.set("from", filters.from);
  if (filters.to) routeParams.set("to", filters.to);
  const routeQuery = routeParams.toString();
  const archiveHref = (date: string) =>
    `/reservations/archive/${date}${routeQuery ? `?${routeQuery}` : ""}`;
  const archives = new Map<string, { total: number; confirmed: number; cancelled: number }>();
  for (const reservation of reservations) {
    const trip = isPopulated(reservation.trip) ? reservation.trip : null;
    const date = trip ? getDateKey(trip.departureDate) : "unknown";
    const archive = archives.get(date) ?? { total: 0, confirmed: 0, cancelled: 0 };
    archive.total++;
    if (reservation.status === "CONFIRMED") archive.confirmed++;
    else archive.cancelled++;
    archives.set(date, archive);
  }
  const archiveDays = [...archives.entries()].sort(([first], [second]) => {
    if (first === "unknown") return 1;
    if (second === "unknown") return -1;
    return second.localeCompare(first);
  });

  return (
    <>
      <PageHeader
        title="Reservation archives"
        description={
          user.role === "EMPLOYEE"
            ? "Open a departure day, choose a trip, then view its passenger reservations. Employee accounts see reservations they created."
            : "Open a departure day, choose a trip, then view its passenger reservations."
        }
      />
      <Card><CardContent className="p-0">
        <form action="/reservations" className="space-y-4 border-b border-slate-200 p-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="reservation-date">
              Trip departure date
              <input
                id="reservation-date"
                name="departureDate"
                type="date"
                defaultValue={filters.departureDate}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="reservation-from">
              Trip departure city
              <select
                id="reservation-from"
                name="from"
                defaultValue={filters.from}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
              >
                <option value="">All departure cities</option>
                {filters.from && !SYRIAN_CITIES.some((city) => city === filters.from) && (
                  <option value={filters.from}>{filters.from}</option>
                )}
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="reservation-to">
              Trip destination city
              <select
                id="reservation-to"
                name="to"
                defaultValue={filters.to}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
              >
                <option value="">All destination cities</option>
                {filters.to && !SYRIAN_CITIES.some((city) => city === filters.to) && (
                  <option value={filters.to}>{filters.to}</option>
                )}
                {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Link
              href="/reservations"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Clear filters
            </Link>
            <Button type="submit">Apply filters</Button>
          </div>
        </form>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr>
              <th className="px-4 py-3 font-medium">Trip departure date</th><th className="px-4 py-3 font-medium">Reservations</th><th className="px-4 py-3 font-medium">Confirmed</th><th className="px-4 py-3 font-medium">Cancelled</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {archiveDays.length ? archiveDays.map(([date, archive]) => (
                <tr key={date} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={archiveHref(date)} className="hover:text-primary">
                      {date === "unknown" ? "Departure date unavailable" : formatArchiveDate(date)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{archive.total}</td>
                  <td className="px-4 py-3">{archive.confirmed}</td>
                  <td className="px-4 py-3">{archive.cancelled}</td>
                </tr>
              )) : <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={4}>No reservation archives found.</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </>
  );
};

export default ReservationsPage;
