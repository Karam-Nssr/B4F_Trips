import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listBuses } from "@/features/buses/buses.api";

const BusesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page = "1" } = await searchParams;
  const { items: buses, pagination } = await listBuses({ page, limit: 20 });

  return (
    <>
      <PageHeader title="Buses & seats" description="Manage fleet buses and review their assigned physical layouts." actions={<div className="flex flex-wrap gap-2"><Link href="/buses/layouts" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50">Seat layouts</Link><Link href="/buses/new"><Button>New bus</Button></Link></div>} />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600"><tr>
                <th className="px-4 py-3 font-medium">Bus</th><th className="px-4 py-3 font-medium">Class</th><th className="px-4 py-3 font-medium">Size</th><th className="px-4 py-3 font-medium">Capacity</th><th className="px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-200">
                {buses.length ? buses.map((bus) => (
                  <tr key={bus._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium"><Link href={`/buses/${bus._id}`} className="hover:text-primary">{bus.busNumber}</Link></td>
                    <td className="px-4 py-3">{bus.busClass}</td><td className="px-4 py-3">{bus.size}</td><td className="px-4 py-3">{bus.capacity}</td><td className="px-4 py-3"><StatusBadge status={bus.isActive ? "ACTIVE" : "INACTIVE"} /></td>
                  </tr>
                )) : <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No buses found.</td></tr>}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && <div className="flex justify-between border-t border-slate-200 p-4 text-sm">
            <span>Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalRecords} buses</span>
            <div className="flex gap-3">
              {pagination.currentPage > 1 && <Link href={`/buses?page=${pagination.currentPage - 1}`}>Previous</Link>}
              {pagination.currentPage < pagination.totalPages && <Link href={`/buses?page=${pagination.currentPage + 1}`}>Next</Link>}
            </div>
          </div>}
        </CardContent>
      </Card>
    </>
  );
};

export default BusesPage;
