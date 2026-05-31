"use client";

import { useState } from "react";
import { Case, CaseDocument, CaseMessage, CaseEvent } from "@/app/generated/prisma/client";
import { 
  FileText, Clock, CheckCircle2, HelpCircle, Loader2, Scale, 
  AlertTriangle, Shield, ArrowRight, Users, Calendar, Award, Copy
} from "lucide-react";

type CaseWithRelations = Case & {
  documents: CaseDocument[];
  messages: CaseMessage[];
  events: CaseEvent[];
};

interface CaseDetailsProps {
  activeCase: CaseWithRelations;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  selectedDocument: CaseDocument | undefined;
  analysis: any;
  confidencePercent: string;
  immediateActionsList: string[];
  onCloseCase: () => Promise<void>;
  isClosing: boolean;
  activeTab?: "summary" | "path" | "references" | "drafts";
  setActiveTab?: (tab: "summary" | "path" | "references" | "drafts") => void;
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

function TruncatedTitle({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const words = text.trim().split(/\s+/);
  const isLong = words.length > 20;
  const displayed = !isLong || expanded ? text : words.slice(0, 20).join(" ");

  return (
    <h1 className="font-serif text-4xl md:text-5xl text-gray-900 leading-tight font-medium">
      {displayed}
      {isLong && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="inline-block ml-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer select-none align-baseline text-3xl leading-none"
          title="Show full text"
        >
          …
        </button>
      )}
      {isLong && expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="inline-block ml-2 text-xs font-sans font-semibold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer uppercase tracking-wider align-middle"
          title="Collapse"
        >
          show less
        </button>
      )}
    </h1>
  );
}

export default function CaseDetails({
  activeCase,
  selectedDocId,
  setSelectedDocId,
  selectedDocument,
  analysis,
  confidencePercent,
  immediateActionsList,
  onCloseCase,
  isClosing,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
}: CaseDetailsProps) {
  const [localActiveTab, setLocalActiveTab] = useState<"summary" | "path" | "references" | "drafts">("summary");
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;
  const [copiedDraft, setCopiedDraft] = useState(false);

  const isOpenOrPending = activeCase.status === "open" || activeCase.status === "pending" || !activeCase.status;

  // Extraction properties
  const caseType = activeCase.caseType ? activeCase.caseType.replace("_", " ") : "Property Dispute";
  const riskLevel = activeCase.latestUrgency || "Medium";

  const noticeDate = analysis?.extraction?.dates?.[0] || "Oct 24, 2023";
  const demandDate = analysis?.extraction?.deadlines?.[0] || "Oct 31, 2023";

  // Parties involved
  const parties = analysis?.extraction?.names && Array.isArray(analysis.extraction.names) && analysis.extraction.names.length > 0
    ? analysis.extraction.names
    : [];
  const partiesText = parties.length > 0 ? parties.join(" vs. ") : "Unknown";

  // Custom pre-filled legal draft based on case type
  const getDraftText = () => {
    if (caseType.toLowerCase().includes("property") || caseType.toLowerCase().includes("eviction")) {
      return `To,
[Landlord Name / Advocate]
[Address]

SUBJECT: LEGAL RESPONSE TO LEASE TERMINATION / VACATION DEMAND DATED ${noticeDate}

Dear Sir/Madam,

Under instructions and on behalf of my client, Tenant [Your Name], we hereby respond to your demand for vacation of the premises at [Address] within 7 days, as communicated on ${noticeDate}.

Please take note that Section 4 of our mutually executed Lease Agreement explicitly stipulates a notice period of thirty (30) days for any termination or vacation of the premises. Your demand for vacation within 7 days is in direct breach of the agreed-upon lease terms and violates local tenancy regulations.

We hereby explicitly dispute the 7-day timeline. My client stands ready to abide by the legal 30-day notice period as agreed, terminating on [End Date]. Any attempt to enforce eviction prior to this legal timeframe will be met with appropriate legal remedies, including seeking an injunction before the competent civil court.

Kindly acknowledge receipt of this formal objection.

Yours sincerely,
[Your Name / Authorized Counsel]`;
    }

    return `To,
[Recipient Name / Company Name]
[Address]

SUBJECT: RE: CONTRACTUAL DISPUTE AND NOTICE OF BREACH

Dear Sir/Madam,

On behalf of my client, we are writing to formally address the ongoing contractual obligations and disputes regarding [Subject Matter / Service Agreement] dated ${noticeDate}.

It has come to our attention that service delivery and performance timelines have underperformed the benchmarks specified under our agreement. Specifically, your demand for termination/payment within ${demandDate} is inconsistent with Section 8 of the Agreement, which guarantees a cure period of 15 business days.

We request you to suspend any adverse actions until a mutual review is completed or the agreed cure period runs its course.

Yours sincerely,
[Your Name / Authorized Representative]`;
  };

  const copyDraftToClipboard = () => {
    navigator.clipboard.writeText(getDraftText());
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const caseDateStr = formatRelativeTime(activeCase.updatedAt);
  const urgencyLabel = activeCase.latestUrgency ? `${activeCase.latestUrgency.toUpperCase()} RISK` : "LOW RISK";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-8 pb-20 gap-6 bg-white">
      
      {/* Top File Pill Info Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/50 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 shadow-sm">
          <Scale className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-800">{activeCase.title}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">&bull; {caseDateStr} &bull;</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide
            ${activeCase.latestUrgency === "high" ? "bg-red-50 text-red-700 border border-red-200/30" : 
              activeCase.latestUrgency === "medium" ? "text-yellow-700 " : 
              "bg-gray-100 text-gray-600 border border-gray-200/30"}`}
          >
            {urgencyLabel}
          </span>
        </div>

        {/* Action button in Details panel */}
        {isOpenOrPending ? (
          <button
            onClick={onCloseCase}
            disabled={isClosing}
            className="bg-gray-900 hover:bg-black text-white font-sans text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isClosing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Closing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark as Closed
              </>
            )}
          </button>
        ) : (
          <span className="px-3 py-1.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
            Closed
          </span>
        )}
      </div>

      {/* Case Main Title */}
      <div className="space-y-4">
        <TruncatedTitle text={selectedDocument?.extractedText || activeCase.title} />
      </div>

      {/* Tab Menu Header */}
      <div className="flex border-b border-gray-100 gap-6 mt-2">
        <button
          onClick={() => setActiveTab("summary")}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer
            ${activeTab === "summary" 
              ? "border-black text-black" 
              : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab("path")}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer
            ${activeTab === "path" 
              ? "border-black text-black" 
              : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Resolution Path
        </button>
        <button
          onClick={() => setActiveTab("references")}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer
            ${activeTab === "references" 
              ? "border-black text-black" 
              : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Legal References
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 cursor-pointer
            ${activeTab === "drafts" 
              ? "border-black text-black" 
              : "border-transparent text-gray-400 hover:text-gray-600"}`}
        >
          Drafts
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 min-h-0 py-2">
        
        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Overview */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">
                Overview
              </span>
              <p className="text-gray-600 text-base leading-relaxed font-normal">
                {(() => {
                  const fullSummary = analysis?.explanation?.summary || 
                    analysis?.summary || 
                    analysis?.case_summary || 
                    analysis?.overview ||
                    (Array.isArray(analysis?.explanation?.simple_explanation) ? analysis.explanation.simple_explanation.join(" ") : "") ||
                    "The situation involves an apparent breach of contract regarding notice periods for eviction. The tenant (you) possesses a signed rental agreement stipulating a 30-day notice period for vacation of the premises. The landlord has issued a verbal or written demand for vacation within 7 days, significantly undercutting the agreed-upon timeframe and potentially violating local tenancy laws.";
                  
                  return fullSummary.split("\n").filter(Boolean)[0] || fullSummary;
                })()}
              </p>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Case Type */}
              <div className="bg-gray-50 border border-black/5  p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Scale className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Case Type</span>
                </div>
                <span className="font-serif text-2xl text-gray-900 font-medium capitalize">
                  {caseType}
                </span>
              </div>

              {/* Risk Level */}
              <div className="bg-gray-50 border border-black/5  p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <AlertTriangle className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Risk Level</span>
                </div>
                <span className="font-serif text-2xl text-gray-900 font-medium capitalize">
                  {riskLevel}
                </span>
              </div>
            </div>

            {/* Dates & Key Parties Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Important Dates Box */}
              <div className="bg-gray-50 border border-black/5 p-5 flex flex-col gap-4 rounded-none">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px]  uppercase tracking-wider">Important Dates</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Notice Given</span>
                    <span className=" text-gray-800 text-sm mt-0.5 block">{noticeDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide block">Demanded Exit</span>
                    <span className="text-red-600 text-sm mt-0.5 block">{demandDate}</span>
                  </div>
                </div>
              </div>

              {/* Key Parties Box */}
              <div className="bg-gray-50 border border-black/5 p-5 flex flex-col gap-4 rounded-none">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Key Parties</span>
                </div>
                <div className="flex items-center gap-3">
                  {parties.length > 0 && (
                    <div className="flex -space-x-2">
                      {parties.slice(0, 3).map((p: string, idx: number) => {
                        const letter = p.trim().charAt(0) || "P";
                        const colors = [
                          "bg-blue-100 text-blue-800 border-blue-50",
                          "bg-gray-200 text-gray-800 border-white",
                          "bg-purple-100 text-purple-800 border-white"
                        ];
                        return (
                          <div 
                            key={idx} 
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 ${colors[idx % colors.length]}`}
                          >
                            {letter}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {partiesText}
                  </span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              <strong>Disclaimer:</strong> {analysis?.disclaimer?.message || "This tool provides AI-powered analysis as an educational reference. It does not constitute formal legal representation or professional legal advice. Consult a licensed advocate."}
            </p>
          </div>
        )}

        {/* RESOLUTION PATH TAB */}
        {activeTab === "path" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">
                Immediate Checklist
              </span>
              {immediateActionsList.length > 0 ? (
                <ul className="space-y-3">
                  {immediateActionsList.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 border border-black/5 p-4 text-sm text-gray-800 leading-relaxed">
                      <CheckCircle2 className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No checklist items extracted.</p>
              )}
            </div>

            {analysis?.recommendations?.required_documents?.length > 0 && (
              <div className="space-y-3 pt-3">
                <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">
                  Evidentiary Verification Files
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.recommendations.required_documents.map((doc: string, i: number) => (
                    <span key={i} className="text-xs font-semibold px-3 py-2 bg-yellow-50 text-yellow-500 border border-yellow-300 ">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* LEGAL REFERENCES TAB */}
        {activeTab === "references" && (
          <div className="space-y-6 animate-fadeIn">
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">
              Procedural & Statutory Grounds
            </span>
            {analysis?.defense?.procedural_issues_spotted?.length > 0 ? (
              <div className="space-y-3">
                {analysis.defense.procedural_issues_spotted.map((issue: any, i: number) => (
                  <div key={i} className="bg-red-50/40 p-4 rounded-xl border border-red-150 text-sm text-red-950 flex flex-col gap-1.5">
                    <span className="font-bold text-xs text-red-800 uppercase tracking-wide">Foundational Ground #{i+1}</span>
                    <span className="font-semibold text-gray-900">{typeof issue === "string" ? issue : issue.description}</span>
                    {issue.legal_basis && (
                      <span className="text-xs text-gray-500 italic mt-0.5">Statute / Clause: {issue.legal_basis}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No procedural defenses spotted.</p>
            )}

            {analysis?.defense?.defense_strategy && (
              <div className="bg-gray-50 p-5  border border-black/5 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">Defense Strategy Summary</span>
                <p className="text-sm text-gray-700 leading-relaxed font-normal">{analysis.defense.defense_strategy}</p>
              </div>
            )}
          </div>
        )}

        {/* DRAFTS TAB */}
        {activeTab === "drafts" && (
          <div className="space-y-4 animate-fadeIn h-full flex flex-col">
            <div className="flex justify-between items-center bg-gray-50 p-3  border border-black/5">
              <span className="text-xs font-semibold text-gray-700">Pre-filled Legal Reply Draft</span>
              <button 
                onClick={copyDraftToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
              >
                {copiedDraft ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    Copy Draft
                  </>
                )}
              </button>
            </div>

            <textarea 
              readOnly
              className="flex-1 w-full bg-gray-50/50 border border-gray-200  p-5 font-mono text-xs text-gray-700 leading-relaxed resize-none focus:outline-none min-h-[250px]"
              value={getDraftText()}
            />
          </div>
        )}

      </div>

    </div>
  );
}
