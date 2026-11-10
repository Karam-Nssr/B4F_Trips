import type { ReactNode } from "react";
import { BusFront, CircleDot } from "lucide-react";

import { Brand } from "@/components/shared/brand";
const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[43%_57%]">
      <section className="hidden flex-col justify-between bg-[#173a64] px-10 py-10 text-white lg:flex xl:px-16">
        <Brand inverse />
        <div className="max-w-lg pb-8">
          <h1 className="text-4xl font-normal leading-tight tracking-tight xl:text-5xl">
            Every journey,
            <br />
            well connected.
          </h1>
          <p className="mt-5 max-w-md text-base leading-6 text-blue-100">
            One workspace for your routes, your team, and the people travelling
            with you.
          </p>
          <div className="mt-16 rounded-2xl bg-white p-6 text-slate-800 shadow-sm">
            <span className="inline-flex rounded-md bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
              A clearer way to travel
            </span>
            <div className="mt-5 flex items-center justify-between text-2xl font-medium">
              <span>From</span>
              <span>To</span>
            </div>
            <div className="relative my-6 flex items-center justify-between">
              <CircleDot className="h-3 w-3 fill-primary text-primary" />
              <span className="absolute left-2 right-2 top-1/2 border-t border-slate-200" />
              <span className="relative z-10 rounded-md bg-white px-2 text-primary">
                <BusFront className="h-6 w-6" />
              </span>
              <CircleDot className="h-3 w-3 fill-primary text-primary" />
            </div>
            <p className="text-sm text-slate-500">
              Staff tools for every departure and passenger.
            </p>
          </div>
        </div>
        <div className="space-y-2 text-xs text-blue-100">
          <p className="font-semibold uppercase tracking-wide">
            Built for the people who keep Syria moving
          </p>
          <p className="text-blue-200">Nawa staff portal</p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-white px-5 py-10 sm:px-10">
        <div className="w-full max-w-lg">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
