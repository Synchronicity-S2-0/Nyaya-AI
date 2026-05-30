import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import UnifiedCasesWorkspace from "@/components/cases/UnifiedCasesWorkspace";
import { redirect } from "next/navigation";

export default async function CasesDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const cases = await prisma.case.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
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

  return (
    <UnifiedCasesWorkspace
      userId={session.user.id}
      initialCases={cases}
      session={session}
    />
  );
}

