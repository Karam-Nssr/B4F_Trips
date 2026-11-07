import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleForm } from "@/features/trips/schedule-form";
import { listBuses } from "@/features/buses/buses.api";
import { getSchedule } from "@/features/trips/schedules.api";
import { ApiError } from "@/lib/api/errors";

const EditSchedulePage = async ({
  params,
}: {
  params: Promise<{ scheduleId: string }>;
}) => {
  const { scheduleId } = await params;
  const [schedule, busResult] = await Promise.all([
    getSchedule(scheduleId).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    }),
    listBuses({ isActive: "true", limit: 100 }),
  ]);
  const bus = typeof schedule.bus === "string" ? schedule.bus : schedule.bus._id;

  return (
    <>
      <PageHeader title="Edit recurring schedule" description="Update the recurring trip template." />
      <Card><CardHeader><CardTitle>Schedule configuration</CardTitle></CardHeader><CardContent className="space-y-4">
        <ScheduleForm
          action="update-schedule"
          buses={busResult.items}
          initial={{ ...schedule, bus }}
        />
      </CardContent></Card>
    </>
  );
};

export default EditSchedulePage;
