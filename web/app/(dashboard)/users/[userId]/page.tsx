import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser } from "@/features/users/users.api";
import { ApiError } from "@/lib/api/errors";

const UserDetailPage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;
  const user = await getUser(userId).catch(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 404) notFound();
      throw error;
    },
  );

  return (
    <>
      <PageHeader title={user.name} description="Account details." actions={
        <div className="flex gap-2">
          {user.role !== "USER" && <Link href={`/users/${user._id}/edit`}><Button variant="outline">Edit</Button></Link>}
          <ActionForm action="delete-user"><input type="hidden" name="id" value={user._id} /><ConfirmSubmit variant="destructive" confirmation="Permanently delete this account?">Delete account</ConfirmSubmit></ActionForm>
        </div>
      } />
      <Card><CardHeader><CardTitle>User information</CardTitle></CardHeader><CardContent className="grid gap-5 text-sm md:grid-cols-2">
        <div><p className="text-slate-500">Email</p><p className="font-medium">{user.email}</p></div>
        <div><p className="text-slate-500">Phone</p><p className="font-medium" dir="ltr">{user.phone || "—"}</p></div>
        <div><p className="text-slate-500">Role</p><p className="font-medium">{user.role}</p></div>
        <div><p className="text-slate-500">Status</p><StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} /></div>
      </CardContent></Card>
    </>
  );
};

export default UserDetailPage;
