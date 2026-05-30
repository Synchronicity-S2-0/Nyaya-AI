import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createCase } from "./actions";
import Link from "next/link";
import { FileText, Plus, Clock, AlertCircle } from "lucide-react";

export default async function CasesDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null; // Handled by layout redirect
  }

  const cases = await prisma.case.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Cases</h1>
        <form action={createCase}>
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            New Case
          </button>
        </form>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No cases</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new case.</p>
          <div className="mt-6">
            <form action={createCase}>
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm gap-2"
              >
                <Plus className="w-4 h-4" />
                New Case
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="relative flex flex-col items-start justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center gap-2 mb-4 w-full">
                <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate" title={c.title}>
                  {c.title}
                </h3>
              </div>
              
              <div className="space-y-2 w-full text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Type:</span>
                  <span className="font-medium text-gray-900 truncate max-w-[120px]">
                    {c.caseType ? c.caseType.replace("_", " ") : "Unknown"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-gray-600">
                  <span>Urgency:</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize
                    ${c.latestUrgency === 'high' ? 'bg-red-50 text-red-700' : 
                      c.latestUrgency === 'medium' ? 'bg-yellow-50 text-yellow-700' : 
                      c.latestUrgency === 'low' ? 'bg-green-50 text-green-700' : 
                      'bg-gray-100 text-gray-700'}`}
                  >
                    {c.latestUrgency || "Unknown"}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Status:</span>
                  <span className="font-medium text-gray-900 capitalize">{c.status}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated {new Date(c.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
