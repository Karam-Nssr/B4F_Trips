import { LoginForm } from "@/features/auth/login-form";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) => {
  const { error, next } = await searchParams;
  if (await getSession()) redirect("/trips");

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
        Staff portal
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Sign in to manage trips and passenger reservations.
      </p>
      <div className="mt-8">
        <LoginForm next={next} initialError={error} />
      </div>
      <p className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        Access is limited to authorized Nawa staff.
      </p>
      <div className="mt-12 border-t border-slate-200 pt-5 text-xs text-slate-500">
        Need access? Contact your administrator.
      </div>
    </div>
  );
};

export default LoginPage;
