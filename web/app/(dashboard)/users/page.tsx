import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listUsers } from "@/features/users/users.api";

const UsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page = "1" } = await searchParams;
  const { items: users, pagination } = await listUsers({ page, limit: 20 });

  return (
    <>
      <PageHeader title="Users" description="Manage staff accounts and review customer accounts." actions={<Link href="/users/new"><Button>New staff account</Button></Link>} />
      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-200">
              {users.length ? users.map((user) => <tr key={user._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium"><Link href={`/users/${user._id}`} className="hover:text-primary">{user.name}</Link></td>
                <td className="px-4 py-3">{user.email}</td><td className="px-4 py-3" dir="ltr">{user.phone || "—"}</td><td className="px-4 py-3">{user.role}</td><td className="px-4 py-3"><StatusBadge status={user.isActive ? "ACTIVE" : "INACTIVE"} /></td>
              </tr>) : <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={5}>No users found.</td></tr>}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && <div className="flex justify-between border-t border-slate-200 p-4 text-sm">
          <span>Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalRecords} users</span><div className="flex gap-3">
            {pagination.currentPage > 1 && <Link href={`/users?page=${pagination.currentPage - 1}`}>Previous</Link>}
            {pagination.currentPage < pagination.totalPages && <Link href={`/users?page=${pagination.currentPage + 1}`}>Next</Link>}
          </div>
        </div>}
      </CardContent></Card>
    </>
  );
};

export default UsersPage;
