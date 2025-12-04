"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";

import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RegisterResult } from "@/types/actions";

const initialState: RegisterResult = {};

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(registerUser, initialState);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-sm text-white/70" htmlFor="email">
          Email
        </label>
        <Input type="email" name="email" id="email" required autoComplete="email" placeholder="you@example.com" />
      </div>
      <div>
        <label className="text-sm text-white/70" htmlFor="password">
          Password
        </label>
        <Input type="password" name="password" id="password" required autoComplete="new-password" minLength={6} />
      </div>
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}
      <Button type="submit" className="w-full">
        Create account
      </Button>
    </form>
  );
}
