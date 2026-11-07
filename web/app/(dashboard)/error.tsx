"use client";

import { Button } from "@/components/ui/button";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const DashboardError = ({ error, reset }: DashboardErrorProps) => (
  <div className="mx-auto mt-12 max-w-lg rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
    <p className="text-sm font-semibold uppercase tracking-widest text-red-700">Request failed</p>
    <h1 className="mt-3 text-xl font-semibold text-slate-900">This page could not be loaded or saved.</h1>
    <p className="mt-2 text-sm text-slate-600">Please try again. If the problem continues, contact an administrator.</p>
    {error.digest && <p className="mt-2 text-xs text-slate-500">Reference: {error.digest}</p>}
    <Button className="mt-5" onClick={reset}>Try again</Button>
  </div>
);

export default DashboardError;
