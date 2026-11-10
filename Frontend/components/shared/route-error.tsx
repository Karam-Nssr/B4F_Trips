"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export const RouteError = ({ error, reset }: RouteErrorProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center px-6 py-12">
      <section className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          An unexpected error occurred. Try again, or return to the portal.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Return to portal
          </Link>
        </div>
      </section>
    </main>
  );
};
