import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listSchedules } from "@/features/trips/schedules.api";
import { formatDate } from "@/lib/domain/types";

const SchedulesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page = "1" } = await searchParams;
  const { items: schedules, pagination } = await listSchedules({ page, limit: 20 });

  return (
    <>
      <PageHeader title="Schedules" description="Recurring templates generate trips within the backend's rolling 30-day window." actions={<Link href="/schedules/new"><Button>New schedule</Button></Link>} />
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr>
              <th className="px-4 py-3 font-medium">Route</th><th className="px-4 py-3 font-medium">Frequency</th><th className="px-4 py-3 font-medium">Date range</th><th className="px-4 py-3 font-medium">Departure</th><th className="px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {schedules.length ? schedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium"><Link href={`/schedules/${schedule._id}`} className="hover:text-primary">{schedule.from} → {schedule.to}</Link><div className="text-xs text-slate-500">{schedule._id}</div></td>
                  <td className="px-4 py-3">{schedule.schedule.frequency}</td>
                  <td className="px-4 py-3">{formatDate(schedule.schedule.startDate)} → {schedule.schedule.endDate ? formatDate(schedule.schedule.endDate) : "No end date"}</td>
                  <td className="px-4 py-3">{schedule.departureTime}</td>
                  <td className="px-4 py-3"><StatusBadge status={schedule.status} /></td>
                </tr>
              )) : <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No recurring schedules found.</td></tr>}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && <div className="flex justify-between border-t border-slate-200 p-4 text-sm">
          <span>Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalRecords} schedules</span>
          <div className="flex gap-3">
            {pagination.currentPage > 1 && <Link href={`/schedules?page=${pagination.currentPage - 1}`}>Previous</Link>}
            {pagination.currentPage < pagination.totalPages && <Link href={`/schedules?page=${pagination.currentPage + 1}`}>Next</Link>}
          </div>
        </div>}
      </CardContent></Card>
    </>
  );
};

export default SchedulesPage;
