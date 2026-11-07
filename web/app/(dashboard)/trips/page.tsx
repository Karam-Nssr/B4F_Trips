import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listAllTrips } from "@/features/trips/trips.api";
import { isPopulated } from "@/lib/domain/types";
import { requireSession } from "@/lib/auth/session";
import { JSX } from "react/jsx-runtime";
import { formatArchiveDate, getDateKey } from "@/lib/domain/dates";
import { SYRIAN_CITIES } from "@/features/trips/trips.constants";

const TripsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<JSX.Element> => {
  const [query, user] = await Promise.all([searchParams, requireSession()]);
  const filters = {
    from: typeof query.from === "string" ? query.from : undefined,
    to: typeof query.to === "string" ? query.to : undefined,
    departureDate:
      typeof query.departureDate === "string" ? query.departureDate : undefined,
    busClass: typeof query.busClass === "string" ? query.busClass : undefined,
    minPrice: typeof query.minPrice === "string" ? query.minPrice : undefined,
    maxPrice: typeof query.maxPrice === "string" ? query.maxPrice : undefined,
  };
  const trips = (await listAllTrips(filters)).filter(
    (trip) => !trip.schedule?.isRecurring,
  );
  const archives = new Map<
    string,
    { tripCount: number; capacity: number; potentialFare: number }
  >();
  for (const trip of trips) {
    const date = getDateKey(trip.departureDate);
    const archive = archives.get(date) ?? {
      tripCount: 0,
      capacity: 0,
      potentialFare: 0,
    };
    const bus = isPopulated(trip.bus) ? trip.bus : null;
    const capacity = bus?.capacity ?? 0;
    archive.tripCount++;
    archive.capacity += capacity;
    archive.potentialFare += trip.price * capacity;
    archives.set(date, archive);
  }
  const archiveDays = [...archives.entries()].sort(([first], [second]) =>
    second.localeCompare(first),
  );
  const archiveParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) archiveParams.set(key, value);
  }
  const archiveQuery = archiveParams.toString();

  return (
    <>
      <PageHeader
        title="Trip archives"
        description="Browse departures grouped by their travel date."
        actions={
          user.role === "ADMIN" ? (
            <Link href="/trips/new">
              <Button>New trip</Button>
            </Link>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="p-0">
          <form action="/trips" className="space-y-4 border-b border-slate-200 p-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="trip-from">
                Departure city
                <select
                  id="trip-from"
                  name="from"
                  defaultValue={filters.from ?? ""}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
                >
                  <option value="">All departure cities</option>
                  {filters.from && !SYRIAN_CITIES.some((city) => city === filters.from) && (
                    <option value={filters.from}>{filters.from}</option>
                  )}
                  {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="trip-to">
                Destination city
                <select
                  id="trip-to"
                  name="to"
                  defaultValue={filters.to ?? ""}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
                >
                  <option value="">All destination cities</option>
                  {filters.to && !SYRIAN_CITIES.some((city) => city === filters.to) && (
                    <option value={filters.to}>{filters.to}</option>
                  )}
                  {SYRIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="trip-date">
                Departure date
                <input
                  id="trip-date"
                  name="departureDate"
                  type="date"
                  defaultValue={filters.departureDate}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="trip-bus-class">
                Bus class
                <select
                  id="trip-bus-class"
                  name="busClass"
                  defaultValue={filters.busClass ?? ""}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
                >
                  <option value="">All bus classes</option>
                  <option value="ORDINARY">Ordinary</option>
                  <option value="FIRST_CLASS">First class</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="trip-min-fare">
                Minimum fare per seat (SYP)
                <input
                  id="trip-min-fare"
                  name="minPrice"
                  type="number"
                  min="0"
                  defaultValue={filters.minPrice}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium text-slate-700" htmlFor="trip-max-fare">
                Maximum fare per seat (SYP)
                <input
                  id="trip-max-fare"
                  name="maxPrice"
                  type="number"
                  min="0"
                  defaultValue={filters.maxPrice}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-normal text-slate-900"
                />
              </label>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Link
                href="/trips"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Clear filters
              </Link>
              <Button type="submit">Apply filters</Button>
            </div>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Departure date</th>
                  <th className="px-4 py-3 font-medium">Trips</th>
                  <th className="px-4 py-3 font-medium">Total seats</th>
                  <th className="px-4 py-3 font-medium">Potential full-capacity fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {archiveDays.length > 0 ? (
                  archiveDays.map(([date, archive]) => (
                    <tr key={date} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          className="font-medium text-slate-900 hover:text-primary"
                          href={`/trips/archive/${date}${archiveQuery ? `?${archiveQuery}` : ""}`}
                        >
                          {formatArchiveDate(date)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{archive.tripCount}</td>
                      <td className="px-4 py-3">{archive.capacity}</td>
                      <td className="px-4 py-3">{archive.potentialFare.toLocaleString()} SYP</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-slate-500"
                      colSpan={4}
                    >
                      No trip archives found for these filters.
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

export default TripsPage;
