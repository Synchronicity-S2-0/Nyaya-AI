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

export async function createNewCaseAction(title: string = "Untitled Case") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const newCase = await prisma.case.create({
    data: {
      userId: session.user.id,
      title,
      status: "open",
    },
  });

  const initialEvent = await prisma.caseEvent.create({
    data: {
      caseId: newCase.id,
      userId: session.user.id,
      eventType: "case_created",
      summary: "Case was created",
    }
  });

  return {
    ...newCase,
    documents: [],
    messages: [],
    events: [initialEvent],
  };
}

export async function closeCaseAction(caseId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const updatedCase = await prisma.case.update({
    where: {
      id: caseId,
      userId: session.user.id,
    },
    data: {
      status: "closed",
    },
  });

  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);

  return { success: true, case: updatedCase };
}





