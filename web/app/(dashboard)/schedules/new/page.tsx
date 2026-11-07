import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleForm } from "@/features/trips/schedule-form";
import { listBuses } from "@/features/buses/buses.api";

const NewSchedulePage = async () => {
  const { items: buses } = await listBuses({ isActive: "true", limit: 100 });
  return (
    <>
      <PageHeader title="New schedule" description="Create a recurring departure template." />
      <Card><CardHeader><CardTitle>Schedule configuration</CardTitle></CardHeader><CardContent className="space-y-4">
        <ScheduleForm action="create-schedule" buses={buses} />
        <div className="flex justify-end"><Link href="/schedules"><Button type="button" variant="outline">Cancel</Button></Link></div>
      </CardContent></Card>
    </>
  );
};

export default NewSchedulePage;
