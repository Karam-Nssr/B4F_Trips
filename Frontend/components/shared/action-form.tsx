"use client";

import { useActionState, type ReactNode } from "react";

import {
  runResourceAction,
  type ResourceAction,
  type ResourceActionState,
} from "@/app/actions/resources";

const initialState: ResourceActionState = {};

export const ActionForm = ({
  action,
  children,
  className,
}: {
  action: ResourceAction;
  children: ReactNode;
  className?: string;
}) => {
  const [state, formAction, pending] = useActionState(
    runResourceAction.bind(null, action),
    initialState,
  );

  return (
    <form action={formAction} className={className} aria-busy={pending}>
      {state.error && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}
      {children}
    </form>
  );
};
