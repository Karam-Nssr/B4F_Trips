import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSchedule } from "@/features/trips/schedules.api";
import { ApiError } from "@/lib/api/errors";
import { formatDate, isPopulated } from "@/lib/domain/types";

const ScheduleDetailPage = async ({
  params,
}: {
  params: Promise<{ scheduleId: string }>;
}) => {
  const { scheduleId } = await params;
  const schedule = await getSchedule(scheduleId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    },
  );
  const bus = isPopulated(schedule.bus) ? schedule.bus : null;

  return (
    <>
      <PageHeader title={`${schedule.from} → ${schedule.to}`} description="Recurring schedule configuration." actions={
        <div className="flex gap-2">
          <Link href={`/schedules/${schedule._id}/edit`}><Button variant="outline">Edit</Button></Link>
          <ActionForm action="delete-schedule"><input type="hidden" name="id" value={schedule._id} /><ConfirmSubmit variant="destructive" confirmation="Delete this schedule and remove or cancel its generated future trips?">Delete schedule</ConfirmSubmit></ActionForm>
        </div>
      } />
      <Card><CardHeader><CardTitle>Configuration</CardTitle></CardHeader><CardContent className="grid gap-5 text-sm md:grid-cols-2">
        <div><p className="text-slate-500">Frequency</p><p className="font-medium">{schedule.schedule.frequency}</p></div>
        <div><p className="text-slate-500">Status</p><StatusBadge status={schedule.status} /></div>
        <div><p className="text-slate-500">Start</p><p className="font-medium">{formatDate(schedule.schedule.startDate)}</p></div>
        <div><p className="text-slate-500">End</p><p className="font-medium">{schedule.schedule.endDate ? formatDate(schedule.schedule.endDate) : "No end date"}</p></div>
        <div><p className="text-slate-500">Departure</p><p className="font-medium">{schedule.departureTime}</p></div>
        <div><p className="text-slate-500">Fare per seat</p><p className="font-medium">{schedule.price.toLocaleString()} SYP</p></div>
        <div><p className="text-slate-500">Bus</p><p className="font-medium">{bus ? `${bus.busNumber} · ${bus.busClass} · ${bus.size}` : "Bus reference unavailable"}</p></div>
        {schedule.schedule.frequency === "WEEKLY" && <div><p className="text-slate-500">Weekdays</p><p className="font-medium">{(schedule.schedule.daysOfWeek ?? []).join(", ") || "Not specified"}</p></div>}
        {schedule.schedule.frequency === "MONTHLY" && <div><p className="text-slate-500">Day of month</p><p className="font-medium">{schedule.schedule.dayOfMonth ?? "Not specified"}</p></div>}
      </CardContent></Card>
    </>
  );
};

export default ScheduleDetailPage;
