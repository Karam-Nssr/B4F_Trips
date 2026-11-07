"use client";

import { useActionState } from "react";

import {
  loginAction,
  type LoginActionState,
} from "@/app/actions/auth";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  next?: string;
  initialError?: string;
};

export const LoginForm = ({ next, initialError }: LoginFormProps) => {
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    loginAction,
    initialError ? { error: initialError } : {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="name@company.com"
        />
      </div>
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-700"
          htmlFor="password"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>
      <SubmitButton className="w-full">Continue to dashboard</SubmitButton>
      <div className="text-center text-sm text-slate-500">
        Staff access only. Customers should use the mobile app.
      </div>
    </form>
  );
};
