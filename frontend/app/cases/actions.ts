"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createCase() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const newCase = await prisma.case.create({
    data: {
      userId: session.user.id,
      title: "Untitled Case",
      status: "open",
    },
  });

  // Create an initial case creation event
  await prisma.caseEvent.create({
    data: {
      caseId: newCase.id,
      userId: session.user.id,
      eventType: "case_created",
      summary: "Case was created",
    }
  });

  revalidatePath("/cases");
  redirect(`/cases/${newCase.id}`);
}

import { cookies } from "next/headers";
import crypto from "crypto";

export async function loginAsMockUser() {
  // 1. Get or create mock user
  let user = await prisma.user.findUnique({
    where: { email: "mockuser@nyaya.ai" }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "mockuser@nyaya.ai",
        name: "Mock Citizen",
        image: "https://api.dicebear.com/7.x/bottts/svg?seed=mock"
      }
    });
  }

  // 2. Create session in DB
  const token = crypto.randomUUID();
  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: {
      id: token,
      token: sessionToken,
      userId: user.id,
      expiresAt,
      ipAddress: "127.0.0.1",
      userAgent: "Mock Browser"
    }
  });

  // 3. Set the cookie
  const cookieStore = await cookies();
  cookieStore.set("better-auth.session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/"
  });

  redirect("/cases");
}

