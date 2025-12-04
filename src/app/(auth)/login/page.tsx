import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginForm } from "@/components/auth/login-form";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/rooms");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-white/70">Sign in to continue chatting</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-white/70">
        New here? <Link href="/register" className="text-white hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
