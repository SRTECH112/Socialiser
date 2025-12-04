"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import type { RegisterResult } from "@/types/actions";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(
  _prevState: RegisterResult,
  formData: FormData,
): Promise<RegisterResult> {
  const parseResult = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parseResult.data.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(parseResult.data.password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return { success: "Account created! You can sign in now." };
}
