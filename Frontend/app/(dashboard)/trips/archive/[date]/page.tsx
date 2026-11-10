import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { listAllTrips } from "@/features/trips/trips.api";
import { requireSession } from "@/lib/auth/session";
import { formatArchiveDate, isValidDateOnly } from "@/lib/domain/dates";
import { isPopulated } from "@/lib/domain/types";

const TripArchiveDayPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const [{ date }, query, user] = await Promise.all([
    params,
    searchParams,
    requireSession(),
  ]);
  if (!isValidDateOnly(date)) notFound();

  const filters = {
    from: typeof query.from === "string" ? query.from : undefined,
    to: typeof query.to === "string" ? query.to : undefined,
    busClass: typeof query.busClass === "string" ? query.busClass : undefined,
    minPrice: typeof query.minPrice === "string" ? query.minPrice : undefined,
    maxPrice: typeof query.maxPrice === "string" ? query.maxPrice : undefined,
  };
  const trips = (
    await listAllTrips({
      ...filters,
      departureDate: date,
    })
  )
    .filter((trip) => !trip.schedule?.isRecurring)
    .sort((first, second) =>
      first.departureTime.localeCompare(second.departureTime),
    );
  const potentialFare = trips.reduce((total, trip) => {
    const bus = isPopulated(trip.bus) ? trip.bus : null;
    return total + trip.price * (bus?.capacity ?? 0);
  }, 0);
  const archiveParams = new URLSearchParams();
  archiveParams.set("departureDate", date);
  for (const [key, value] of Object.entries(filters)) {
    if (value) archiveParams.set(key, value);
  }
  const archiveQuery = archiveParams.toString();

  return (
    <>
      <PageHeader
        title={`Trips · ${formatArchiveDate(date)}`}
        description={`${trips.length} departure(s) · Potential full-capacity fare ${potentialFare.toLocaleString()} SYP`}
        actions={
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href={`/trips${archiveQuery ? `?${archiveQuery}` : ""}`}
          >
            Back to trip archives
          </Link>
        }
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Bus</th>
                  <th className="px-4 py-3 font-medium">Fare per seat</th>
                  <th className="px-4 py-3 font-medium">Capacity</th>
                  <th className="px-4 py-3 font-medium">Potential trip fare</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Staff action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trips.length ? (
                  trips.map((trip) => {
                    const bus = isPopulated(trip.bus) ? trip.bus : null;
                    const capacity = bus?.capacity ?? 0;
                    return (
                      <tr key={trip._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link
                            className="font-medium text-slate-900 hover:text-primary"
                            href={`/trips/${trip._id}`}
                          >
                            {trip.from} → {trip.to}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{trip.departureTime}</td>
                        <td className="px-4 py-3">
                          {bus
                            ? `${bus.busNumber} · ${bus.busClass}`
                            : "Bus details unavailable"}
                        </td>
                        <td className="px-4 py-3">
                          {trip.price.toLocaleString()} SYP
                        </td>
                        <td className="px-4 py-3">{capacity || "—"}</td>
                        <td className="px-4 py-3">
                          {(trip.price * capacity).toLocaleString()} SYP
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={trip.status} />
                        </td>
                        <td className="px-4 py-3">
                          {trip.status === "SCHEDULED" &&
                          !trip.schedule?.isRecurring ? (
                            <Link
                              href={`/trips/${trip._id}/book`}
                              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 py-8 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Reserve seats for passengers
                            </Link>
                          ) : (
                            <span className="text-slate-500">Unavailable</span>
                          )}
                          {user.role === "ADMIN" && (
                            <Link
                              className="ml-3 text-primary hover:underline"
                              href={`/trips/${trip._id}`}
                            >
                              Details
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-slate-500"
                      colSpan={8}
                    >
                      No trips found for this day.
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

export default TripArchiveDayPage;
