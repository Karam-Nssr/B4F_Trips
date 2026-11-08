import { PageHeader } from "@/components/shared/page-header";
import { ScheduleForm } from "@/features/trips/schedule-form";
import { listBuses } from "@/features/buses/buses.api";

const NewSchedulePage = async () => {
  const { items: buses } = await listBuses({ isActive: "true", limit: 100 });
  return (
    <>
      <PageHeader title="New schedule" description="Create a recurring departure template." />
      <ScheduleForm action="create-schedule" buses={buses} />
    </>
  );
};

export default NewSchedulePage;
