import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The route you are looking for does not exist in this portal.</p>
        <Link href="/trips" className="mt-6 inline-block">
          <Button>Back to trips</Button>
        </Link>
      </div>
    </div>
  );
}
