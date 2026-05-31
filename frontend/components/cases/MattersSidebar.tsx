"use client";

import { useState } from "react";
import { Case, CaseDocument, CaseMessage, CaseEvent } from "@/app/generated/prisma/client";
import { History, FolderOpen, ChevronDown, ChevronUp, Plus, User, LogOut, X } from "lucide-react";
import { signOut } from "@/lib/auth-client";

type CaseWithRelations = Case & {
  documents: CaseDocument[];
  messages: CaseMessage[];
  events: CaseEvent[];
};

interface MattersSidebarProps {
  cases: CaseWithRelations[];
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  session: any;
  isOpen?: boolean;
  onClose?: () => void;
}

function formatRelativeTime(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return "Yesterday";
  } else {
    return `${diffDays} days ago`;
  }
}

export default function MattersSidebar({
  cases,
  selectedCaseId,
  setSelectedCaseId,
  session,
  isOpen,
  onClose,
}: MattersSidebarProps) {
  const [isPastExpanded, setIsPastExpanded] = useState(false);
  const [isActiveExpanded, setIsActiveExpanded] = useState(true);

  // Group cases into active and past
  const activeCases = cases.filter((c) => c.status !== "closed");
  const pastCases = cases.filter((c) => c.status === "closed");

  const renderCaseList = (caseGroup: CaseWithRelations[]) => {
    return (
      <div className="mt-2 space-y-2">
        {caseGroup.map((c) => {
          const isSelected = selectedCaseId === c.id;
          const timeLabel = formatRelativeTime(c.updatedAt);
          
          const latestDoc = c.documents[0];
          const docAnalysis = latestDoc?.analysisJson as any;
          const briefText = docAnalysis?.explanation?.summary || 
            docAnalysis?.explanation?.simple_explanation?.[0] || 
            latestDoc?.fileName || 
            "Reviewing legal options and matter documentation.";

          const urgency = c.latestUrgency?.toLowerCase() || "low";
          let dotColor = "bg-gray-400";
          let urgencyLabel = "Low Risk";

          if (urgency === "high") {
            dotColor = "bg-red-500";
            urgencyLabel = "High Risk";
          } else if (urgency === "medium") {
            dotColor = "bg-amber-500";
            urgencyLabel = "Medium Risk";
          }

          const caseTypeLabel = c.caseType ? c.caseType.replace("_", " ") : "Property";

          return (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.id);
                onClose?.();
              }}
              className={`p-4 rounded-2xl border transition-all duration-300 group cursor-pointer text-left
                ${isSelected 
                  ? "bg-gray-100/80 border-gray-300/40" 
                  : "bg-transparent border-transparent hover:bg-gray-100/50"}`}
            >
              <div className="flex justify-between items-start mb-1 gap-2">
                <h4 className="text-gray-900 leading-tight font-sans text-sm font-semibold truncate flex-1">
                  {c.title}
                </h4>
                <span className="font-sans text-[9px] text-gray-400 font-bold uppercase shrink-0">
                  {timeLabel}
                </span>
              </div>
              <p className="font-sans text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                {briefText}
              </p>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`}></span>
                <span className="font-sans text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  {urgencyLabel} • {caseTypeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <nav className={`
      fixed left-0 top-0 h-screen w-[320px] bg-[#FAFAF8] border-r border-gray-200/80 p-6 gap-6 z-40 shrink-0 flex flex-col
      transition-transform duration-300 ease-in-out md:translate-x-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* Header */}
      <div className="px-2 pt-2 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl text-gray-900 font-medium tracking-tight">Nyaya AI</h1>
          <p className="font-sans text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
            Legal Intelligence
          </p>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-black cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CTA Button */}
      <div className="px-2">
        <button
          onClick={() => {
            setSelectedCaseId(null);
            onClose?.();
          }}
          className="w-full bg-black text-white rounded-full py-3.5 px-6 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-300 font-sans text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Consultation</span>
        </button>
      </div>

      {/* Folders Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-4">
        {/* Past Cases Folder */}
        <div>
          <button
            onClick={() => setIsPastExpanded(!isPastExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100/50 transition-colors duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
              <span className="font-sans text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">
                Past Cases
              </span>
            </div>
            {isPastExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {isPastExpanded && (
            pastCases.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic px-4 py-2">No closed cases</p>
            ) : (
              renderCaseList(pastCases)
            )
          )}
        </div>

        {/* Active Cases Folder */}
        <div>
          <button
            onClick={() => setIsActiveExpanded(!isActiveExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100/50 transition-colors duration-200 group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
              <span className="font-sans text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">
                Active Cases
              </span>
            </div>
            {isActiveExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {isActiveExpanded && (
            activeCases.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic px-4 py-2">No active cases</p>
            ) : (
              renderCaseList(activeCases)
            )
          )}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      {session?.user && (
        <div className="pt-4 border-t border-gray-200/60 px-2 space-y-1">
          <a
            href="#profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100/50 hover:text-black transition-all group font-sans text-sm font-semibold"
          >
            <User className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
            <span>Profile</span>
          </a>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100/50 hover:text-black transition-all group font-sans text-sm font-semibold cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
