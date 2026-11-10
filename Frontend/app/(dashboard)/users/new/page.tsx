import Link from "next/link";

import { ActionForm } from "@/components/shared/action-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/submit-button";

const NewUserPage = () => (
  <>
    <PageHeader title="Create staff account" description="Only administrator and employee accounts can be created from the portal." />
    <Card><CardHeader><CardTitle>Staff account</CardTitle></CardHeader><CardContent>
      <ActionForm action="create-user" className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">Name<Input name="name" autoComplete="name" required minLength={2} /></label>
        <label className="space-y-2 text-sm font-medium text-slate-700">Email<Input name="email" type="email" autoComplete="email" required /></label>
        <label className="space-y-2 text-sm font-medium text-slate-700">Phone<Input name="phone" type="tel" dir="ltr" autoComplete="tel" required minLength={7} /></label>
        <label className="space-y-2 text-sm font-medium text-slate-700">Temporary password<Input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
        <label className="space-y-2 text-sm font-medium text-slate-700">Role
          <select name="role" className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900"><option value="EMPLOYEE">Employee</option><option value="ADMIN">Administrator</option></select>
        </label>
        <div className="flex items-end justify-end gap-3"><Link href="/users"><Button type="button" variant="outline">Cancel</Button></Link><SubmitButton>Create account</SubmitButton></div>
      </ActionForm>
    </CardContent></Card>
  </>
);

export default NewUserPage;
