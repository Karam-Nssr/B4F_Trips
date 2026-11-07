import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) => {
  const { error, next } = await searchParams;
  if (await getSession()) redirect("/trips");

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="mb-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          Staff portal
        </div>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm next={next} initialError={error} />
      </CardContent>
    </Card>
  );
};

export default LoginPage;
