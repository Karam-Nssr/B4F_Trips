import { PageHeader } from "@/components/shared/page-header";
import { BusLayoutReference } from "@/features/buses/bus-layout-reference";
import { requireRole } from "@/lib/auth/session";

const BusLayoutsPage = async () => {
  await requireRole(["ADMIN"]);

  return (
    <>
      <PageHeader
        title="A place for every passenger"
        description="Six standard layouts. Seat numbers run from front to rear; the driver is not included in capacity."
      />
      <BusLayoutReference />
      <p className="mt-5 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
        Ordinary buses have one middle seat in the rearmost row. These layouts
        are references; bus assignments and seat availability are shown on each
        bus or trip.
      </p>
    </>
  );
};

export default BusLayoutsPage;
