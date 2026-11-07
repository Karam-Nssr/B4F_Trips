import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatLayoutView } from "@/features/seat-map/seat-layout-view";
import { getBusSeats } from "@/features/buses/buses.api";
import { ApiError } from "@/lib/api/errors";

const BusDetailPage = async ({
  params,
}: {
  params: Promise<{ busId: string }>;
}) => {
  const { busId } = await params;
  const result = await getBusSeats(busId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    },
  );
  const { bus, seats } = result;

  return (
    <>
      <PageHeader
        title={bus.busNumber}
        description="Physical bus profile and seat layout."
        actions={
          <div className="flex gap-2">
            <Link href={`/buses/${bus._id}/edit`}><Button variant="outline">Edit</Button></Link>
            {bus.isActive && <ActionForm action="deactivate-bus">
              <input type="hidden" name="id" value={bus._id} />
              <ConfirmSubmit variant="outline" confirmation="Deactivate this bus? It will no longer be available for new trips.">Deactivate</ConfirmSubmit>
            </ActionForm>}
            <ActionForm action="delete-bus">
              <input type="hidden" name="id" value={bus._id} />
              <ConfirmSubmit variant="destructive" confirmation="Delete this bus? The backend blocks deletion while any trip references it.">Delete</ConfirmSubmit>
            </ActionForm>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Bus information</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Class</span><span className="font-medium">{bus.busClass}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="font-medium">{bus.size}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Capacity</span><span className="font-medium">{bus.capacity}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadge status={bus.isActive ? "ACTIVE" : "INACTIVE"} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Seat layout</CardTitle><p className="text-sm text-slate-500">{seats.length} seats</p></CardHeader>
          <CardContent><SeatLayoutView seats={seats.map(({ _id, ...seat }) => ({ ...seat, id: _id, status: seat.isActive ? "AVAILABLE" : "UNAVAILABLE" }))} /></CardContent>
        </Card>
      </div>
    </>
  );
};

export default BusDetailPage;
