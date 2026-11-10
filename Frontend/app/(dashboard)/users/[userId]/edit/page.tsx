import { notFound, redirect } from "next/navigation";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/submit-button";
import { getUser } from "@/features/users/users.api";
import { ApiError } from "@/lib/api/errors";

const EditUserPage = async ({
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
  if (user.role === "USER") redirect(`/users/${user._id}`);

  return (
    <>
      <PageHeader title={`Edit ${user.name}`} description="Update staff account details and access." />
      <Card><CardHeader><CardTitle>Account information</CardTitle></CardHeader><CardContent>
        <ActionForm action="update-user" className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="id" value={user._id} />
          <label className="space-y-2 text-sm font-medium text-slate-700">Name<Input name="name" defaultValue={user.name} required minLength={2} /></label>
          <label className="space-y-2 text-sm font-medium text-slate-700">Email<Input name="email" type="email" defaultValue={user.email} required /></label>
          <label className="space-y-2 text-sm font-medium text-slate-700">Phone<Input name="phone" type="tel" dir="ltr" defaultValue={user.phone} /></label>
          <label className="space-y-2 text-sm font-medium text-slate-700">Role
            <select name="role" defaultValue={user.role} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"><option value="EMPLOYEE">Employee</option><option value="ADMIN">Administrator</option></select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">Account status
            <select name="isActive" defaultValue={user.isActive ? "true" : "false"} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"><option value="true">Active</option><option value="false">Inactive</option></select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">New password (optional)<Input name="password" type="password" autoComplete="new-password" /></label>
          <div className="flex justify-end md:col-span-2"><SubmitButton>Save changes</SubmitButton></div>
        </ActionForm>
      </CardContent></Card>
    </>
  );
};

export default EditUserPage;
