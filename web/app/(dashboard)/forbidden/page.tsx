import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center shadow-sm">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Access denied</p>
      <h1 className="text-3xl font-semibold text-slate-900">This portal is for staff only.</h1>
      <p className="mt-3 text-slate-600">
        Customers should use the mobile application. Contact an administrator if you believe this is a mistake.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/trips">
          <Button>Go to trips</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Sign in again</Button>
        </Link>
      </div>
    </div>
  );
}
