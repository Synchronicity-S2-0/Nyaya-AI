import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import CaseWorkspace from "./CaseWorkspace";

export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const caseData = await prisma.case.findUnique({
    where: {
      id: caseId,
      userId: session.user.id,
    },
    include: {
      documents: {
        orderBy: { createdAt: "desc" },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!caseData) {
    notFound();
  }

  return (
    <CaseWorkspace
      userId={session.user.id}
      initialCase={caseData}
    />
  );
}
