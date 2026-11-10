import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusForm } from "@/features/buses/bus-form";
import { getBus } from "@/features/buses/buses.api";
import { ApiError } from "@/lib/api/errors";

const EditBusPage = async ({
  params,
}: {
  params: Promise<{ busId: string }>;
}) => {
  const { busId } = await params;
  const bus = await getBus(busId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    },
  );

  return (
    <>
      <PageHeader title={`Edit ${bus.busNumber}`} description="Update bus identity and configuration." />
      <Card><CardHeader><CardTitle>Bus details</CardTitle></CardHeader><CardContent><BusForm action="update-bus" initial={bus} /></CardContent></Card>
    </>
  );
};

export default EditBusPage;
