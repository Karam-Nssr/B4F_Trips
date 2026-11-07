import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusForm } from "@/features/buses/bus-form";

const NewBusPage = () => (
  <>
    <PageHeader title="New bus" description="Create a bus and its seat configuration." />
    <Card>
      <CardHeader><CardTitle>Bus details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <BusForm action="create-bus" />
        <div className="flex justify-end">
          <Link href="/buses"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </CardContent>
    </Card>
  </>
);

export default NewBusPage;
