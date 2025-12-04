import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { RegisterForm } from "@/components/auth/register-form";
import { authOptions } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/rooms");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-white/70">It only takes a moment to join the community</p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-white/70">
        Already have an account? <Link href="/login" className="text-white hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
