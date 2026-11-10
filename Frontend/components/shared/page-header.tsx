import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export const PageHeader = ({ title, description, actions, className }: PageHeaderProps) => (
  <div className={cn("mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
    <div>
      <h1 className="text-2xl font-medium tracking-tight text-slate-900 md:text-3xl">{title}</h1>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);
