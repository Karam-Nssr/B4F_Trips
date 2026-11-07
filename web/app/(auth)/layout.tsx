import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-950 px-12 py-10 text-white lg:flex">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
            B4F
          </p>
          <h1 className="mt-2 text-2xl font-semibold">Intercity Trips</h1>
        </div>
        <div className="max-w-lg pb-16">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">
            Staff workspace
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight">
            Manage every departure with confidence.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
            A dedicated workspace for trip operations and reception teams.
          </p>
        </div>
        <p className="text-sm text-slate-400">B4F Trips Portal</p>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  );
};

export default AuthLayout;
