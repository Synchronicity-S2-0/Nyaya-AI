"use client";

import { useState, useRef, useEffect } from "react";
import { Case, CaseDocument, CaseMessage, CaseEvent } from "@/app/generated/prisma/client";
import { analyzeCaseText, analyzeCaseFile, sendCaseMessage } from "@/lib/api-client";
import { saveDocumentAnalysis, saveChatInteraction } from "@/app/cases/[caseId]/actions";
import { createNewCaseAction } from "@/app/cases/actions";
import { signOut } from "@/lib/auth-client";
import { 
  FileText, Upload, Send, AlertCircle, Clock, FileKey, CheckCircle2, 
  HelpCircle, MessageSquare, Loader2, ChevronDown, ChevronUp, AlertTriangle,
  Paperclip, X, Scale, Sparkles, User, Bot, Calendar, Landmark, Shield, ArrowRight,
  Plus, History, LayoutDashboard, LogOut
} from "lucide-react";

const PENDING_HERO_PROMPT_KEY = "nyaya.pendingHeroPrompt";

type CaseWithRelations = Case & {
  documents: CaseDocument[];
  messages: CaseMessage[];
  events: CaseEvent[];
};

export default function UnifiedCasesWorkspace({
  userId,
  initialCases,
  session,
}: {
  userId: string;
  initialCases: CaseWithRelations[];
  session: any;
}) {
  const [cases, setCases] = useState<CaseWithRelations[]>(initialCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Active case workspace states
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"chat" | "analyze">("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // New Case wizard states
  const [wizardText, setWizardText] = useState("");
  const [wizardFile, setWizardFile] = useState<File | null>(null);
  const [wizardMode, setWizardMode] = useState<"text" | "file">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wizardFileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeCase = cases.find((c) => c.id === selectedCaseId);

  // Auto-scroll chat when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeCase?.messages, activeCase?.events]);

  // Reset workspace input states when switching cases
  useEffect(() => {
    setInputText("");
    setAttachedFile(null);
    setInputMode("chat");
    setSelectedDocId(null);
    if (activeCase && activeCase.documents.length > 0) {
      setSelectedDocId(activeCase.documents[0].id);
    }
  }, [selectedCaseId]);

  // Set selected document automatically when a case is loaded or updated
  useEffect(() => {
    if (activeCase && activeCase.documents.length > 0 && !selectedDocId) {
      setSelectedDocId(activeCase.documents[0].id);
    }
  }, [activeCase, selectedDocId]);

  const selectedDocument = activeCase?.documents.find((d) => d.id === selectedDocId) || activeCase?.documents[0];
  const analysis = selectedDocument?.analysisJson as any;

  useEffect(() => {
    const pendingPrompt = window.localStorage.getItem(PENDING_HERO_PROMPT_KEY);
    if (pendingPrompt === null) return;

    window.localStorage.removeItem(PENDING_HERO_PROMPT_KEY);

    const startLandingCase = async () => {
      const trimmedPrompt = pendingPrompt.trim();
      const title = trimmedPrompt
        ? trimmedPrompt.substring(0, 30) + (trimmedPrompt.length > 30 ? "..." : "")
        : "New Consultation";
      const newCase = await createNewCaseAction(title);

      const emptyCase: CaseWithRelations = {
        id: newCase.id,
        userId: newCase.userId,
        title: newCase.title,
        caseType: newCase.caseType,
        status: newCase.status,
        latestUrgency: newCase.latestUrgency,
        createdAt: new Date(newCase.createdAt),
        updatedAt: new Date(newCase.updatedAt),
        documents: [],
        messages: [],
        events: newCase.events,
      };

      setCases((prev) => [emptyCase, ...prev]);
      setSelectedCaseId(newCase.id);
      setTimeout(() => {
        setInputMode("chat");
        setInputText(pendingPrompt);
      }, 0);
    };

    startLandingCase().catch((error) => {
      console.error("Failed to start consultation from landing prompt:", error);
      if (pendingPrompt.trim()) {
        setTimeout(() => {
          setWizardMode("text");
          setWizardText(pendingPrompt);
        }, 0);
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAttachedFile(e.target.files[0]);
      setInputMode("analyze");
    }
  };

  const handleWizardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setWizardFile(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if (!activeCase) return;
    if (!inputText.trim() && !attachedFile) return;

    setIsLoading(true);
    try {
      if (inputMode === "analyze" || attachedFile) {
        let result;
        if (attachedFile) {
          const mockFileUrl = "https://example.com/mock-file.pdf";
          result = await analyzeCaseFile(
            activeCase.id,
            userId,
            attachedFile,
            mockFileUrl,
            undefined,
            selectedLanguage
          );
        } else {
          result = await analyzeCaseText(
            activeCase.id,
            userId,
            inputText,
            undefined,
            selectedLanguage
          );
        }

        const saveRes = await saveDocumentAnalysis(activeCase.id, userId, result);
        
        if (saveRes.success && saveRes.document) {
          // Update client state
          setCases((prevCases) =>
            prevCases.map((c) => {
              if (c.id === activeCase.id) {
                // Update doc lists, events, and update case attributes
                const updatedDocs = [saveRes.document as CaseDocument, ...c.documents];
                const suggestedEvents = (result.suggested_events || []).map((evt: any, i: number) => ({
                  id: `new-evt-${Date.now()}-${i}`,
                  caseId: c.id,
                  userId,
                  eventType: evt.event_type as any,
                  summary: evt.summary,
                  metadataJson: evt.metadata_json || {},
                  createdAt: new Date(),
                }));
                const updatedEvents = [...suggestedEvents, ...c.events];

                return {
                  ...c,
                  documents: updatedDocs,
                  events: updatedEvents,
                  title: result.case_update?.title || c.title,
                  caseType: result.case_update?.case_type || c.caseType,
                  latestUrgency: result.case_update?.latest_urgency || c.latestUrgency,
                  status: result.case_update?.status || c.status,
                  updatedAt: new Date(),
                };
              }
              return c;
            })
          );
          setSelectedDocId(saveRes.document.id);
        }

        setAttachedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setInputText("");
      } else {
        // Chat mode
        const formattedDocs = activeCase.documents.map((d) => ({
          id: d.id,
          case_id: d.caseId,
          user_id: d.userId,
          source_type: d.sourceType,
          file_url: d.fileUrl,
          file_name: d.fileName,
          extracted_text: d.extractedText,
          analysis_json: d.analysisJson,
          document_type: d.documentType,
          created_at: d.createdAt.toISOString(),
        }));

        const formattedMsgs = activeCase.messages.map((m) => ({
          id: m.id,
          case_id: m.caseId,
          user_id: m.userId,
          role: m.role,
          message: m.message,
          created_at: m.createdAt.toISOString(),
        }));

        const formattedEvents = activeCase.events.map((e) => ({
          id: e.id,
          case_id: e.caseId,
          user_id: e.userId,
          event_type: e.eventType,
          summary: e.summary,
          metadata_json: e.metadataJson,
          created_at: e.createdAt.toISOString(),
        }));

        const result = await sendCaseMessage(
          activeCase.id,
          userId,
          inputText,
          formattedDocs,
          formattedMsgs,
          formattedEvents
        );

        await saveChatInteraction(activeCase.id, userId, result);

        // Update local state
        setCases((prevCases) =>
          prevCases.map((c) => {
            if (c.id === activeCase.id) {
              const newMsgs: CaseMessage[] = [
                {
                  id: `msg-user-${Date.now()}`,
                  caseId: c.id,
                  userId,
                  role: "user",
                  message: inputText,
                  createdAt: new Date(),
                },
                {
                  id: `msg-bot-${Date.now()}`,
                  caseId: c.id,
                  userId,
                  role: "assistant",
                  message: result.assistant_message.message,
                  createdAt: new Date(),
                },
              ];

              const suggestedEvents = (result.suggested_events || []).map((evt: any, i: number) => ({
                id: `new-chat-evt-${Date.now()}-${i}`,
                caseId: c.id,
                userId,
                eventType: evt.event_type as any,
                summary: evt.summary,
                metadataJson: evt.metadata_json || {},
                createdAt: new Date(),
              }));

              return {
                ...c,
                messages: [...c.messages, ...newMsgs],
                events: [...suggestedEvents, ...c.events],
                updatedAt: new Date(),
              };
            }
            return c;
          })
        );

        setInputText("");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your backend connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new case submission inside wizard
  const handleWizardSubmit = async () => {
    if (wizardMode === "text" && !wizardText.trim()) return;
    if (wizardMode === "file" && !wizardFile) return;

    setIsLoading(true);
    try {
      const rawText = wizardText.trim();
      const caseTitle = wizardFile 
        ? wizardFile.name.replace(/\.[^/.]+$/, "").substring(0, 30)
        : rawText.length > 0 
          ? rawText.substring(0, 30) + (rawText.length > 30 ? "..." : "")
          : "New Consultation";
      
      const newCase = await createNewCaseAction(caseTitle);

      // 2. Perform the initial analysis on the backend
      let result;
      if (wizardMode === "file" && wizardFile) {
        const mockFileUrl = "https://example.com/mock-file.pdf";
        result = await analyzeCaseFile(
          newCase.id,
          userId,
          wizardFile,
          mockFileUrl,
          undefined,
          selectedLanguage
        );
      } else {
        result = await analyzeCaseText(
          newCase.id,
          userId,
          wizardText,
          undefined,
          selectedLanguage
        );
      }

      // 3. Save the document and event data in the DB
      const saveRes = await saveDocumentAnalysis(newCase.id, userId, result);

      if (saveRes.success && saveRes.document) {
        const populatedCase: CaseWithRelations = {
          id: newCase.id,
          userId: newCase.userId,
          title: result.case_update?.title || newCase.title,
          caseType: result.case_update?.case_type || null,
          status: result.case_update?.status || "open",
          latestUrgency: result.case_update?.latest_urgency || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          documents: [saveRes.document as CaseDocument],
          messages: [],
          events: [
            ...newCase.events,
            ...(result.suggested_events || []).map((evt: any, i: number) => ({
              id: `evt-wiz-${Date.now()}-${i}`,
              caseId: newCase.id,
              userId,
              eventType: evt.event_type as any,
              summary: evt.summary,
              metadataJson: evt.metadata_json || {},
              createdAt: new Date(),
            })),
          ],
        };

        // Append to state, select the new case and reset wizard state
        setCases((prev) => [populatedCase, ...prev]);
        setSelectedCaseId(newCase.id);
        setSelectedDocId(saveRes.document.id);
        setWizardText("");
        setWizardFile(null);
        if (wizardFileInputRef.current) wizardFileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initialize case analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const rawConfidence = analysis?.classification?.confidence_score ?? analysis?.classification?.confidence;
  const confidencePercent = typeof rawConfidence === "number" 
    ? (rawConfidence * 100).toFixed(0) 
    : "100";

  const immediateActionsList = analysis?.recommendations?.next_steps ?? analysis?.recommendations?.immediate_actions ?? [];

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
      
      {/* 1. LEFT SIDEBAR: Cases list history */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-gray-700" />
              Your Matters
            </h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
              {cases.length}
            </span>
          </div>

          <button
            onClick={() => setSelectedCaseId(null)}
            className={`w-full py-2.5 px-4 rounded-xl font-body-md text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border
              ${selectedCaseId === null 
                ? "bg-gray-900 border-gray-900 text-white shadow-sm" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}
          >
            <Plus className="w-4 h-4" />
            New Consultation
          </button>
        </div>

        {/* Scrollable matters history */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cases.length === 0 ? (
            <div className="text-center py-10 px-4">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400">No active cases</p>
              <p className="text-[10px] text-gray-400 mt-1">Start a new consultation to create a case record.</p>
            </div>
          ) : (
            cases.map((c) => {
              const isSelected = selectedCaseId === c.id;
              const dateStr = new Date(c.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              const caseLabel = c.caseType ? c.caseType.replace("_", " ") : "Property Dispute";

              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 relative cursor-pointer
                    ${isSelected 
                      ? "bg-blue-50/75 border-blue-200 shadow-sm" 
                      : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  <div className="flex justify-between items-start gap-2 w-full">
                    <span className="font-semibold text-gray-900 text-sm truncate leading-tight flex-1">
                      {c.title}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium shrink-0 mt-0.5">{dateStr}</span>
                  </div>

                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider capitalize truncate max-w-[120px]">
                      {caseLabel}
                    </span>

                    {c.latestUrgency && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                        ${c.latestUrgency === "high" ? "bg-red-50 text-red-700" : 
                          c.latestUrgency === "medium" ? "bg-yellow-50 text-yellow-700" : 
                          "bg-green-50 text-green-700"}`}
                      >
                        {c.latestUrgency}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Footer User Profile & Logout section */}
        {session?.user && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {session.user.name?.charAt(0) || session.user.email.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-gray-800 truncate leading-snug">
                  {session.user.name || "Account User"}
                </span>
                <span className="text-[10px] text-gray-400 truncate leading-none mt-0.5">
                  {session.user.email}
                </span>
              </div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
              className="p-2 hover:bg-gray-200/80 text-gray-500 hover:text-gray-900 rounded-xl transition-all cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>

      {/* 2. CENTRAL PANEL & DYNAMIC CONTENT */}
      <main className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden">
        {selectedCaseId === null ? (
          
          // ================= STATE A: NEW CASE DEFAULT WIZARD =================
          <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-8 animate-fadeIn">
              
              {/* Header Greeting */}
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-6 h-6 text-gray-900" />
                </div>
                <h1 className="font-serif text-3xl text-gray-900 leading-tight">
                  Nyaya AI Legal Assistant
                </h1>
                <p className="font-sans text-sm text-gray-500 max-w-md mx-auto">
                  Resolve legal uncertainty instantly. Upload a legal notice, document, or describe your situation in plain English.
                </p>
              </div>

              {/* Input Mode Selector Toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setWizardMode("file")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${wizardMode === "file" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Document
                </button>
                <button
                  onClick={() => setWizardMode("text")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${wizardMode === "text" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Notice Text
                </button>
              </div>

              {/* Wizard Content Input fields */}
              <div className="space-y-4">
                {wizardMode === "file" ? (
                  
                  // Drag & Drop / File Selector Area
                  <div 
                    onClick={() => wizardFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-gray-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-gray-50/50 flex flex-col items-center justify-center gap-3 group"
                  >
                    <input
                      type="file"
                      ref={wizardFileInputRef}
                      className="hidden"
                      onChange={handleWizardFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-150 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {wizardFile ? wizardFile.name : "Choose a legal document"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PDF, DOCX, or TXT up to 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  
                  // Plain Text Paste Area
                  <textarea
                    className="w-full text-sm text-gray-800 placeholder-gray-400 border border-gray-300 rounded-2xl p-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:outline-none min-h-[8rem] resize-none"
                    placeholder="Paste full text of the eviction notice, court order, or letter here..."
                    value={wizardText}
                    onChange={(e) => setWizardText(e.target.value)}
                  />
                )}

                {/* Bottom Wizard Settings */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language:</span>
                    <select
                      className="text-xs border border-gray-200 bg-white px-2.5 py-1.5 rounded-lg focus:outline-none"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                    >
                      <option value="en">English (EN)</option>
                      <option value="hi">Hindi (HI)</option>
                      <option value="ta">Tamil (TA)</option>
                      <option value="te">Telugu (TE)</option>
                      <option value="kn">Kannada (KN)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleWizardSubmit}
                    disabled={(wizardMode === "text" && !wizardText.trim()) || (wizardMode === "file" && !wizardFile) || isLoading}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running AI analysis...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze and Start Case
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : activeCase ? (
          
          // ================= STATE B: ACTIVE CASE WORKSPACE =================
          <div className="flex-1 flex flex-col lg:flex-row gap-0 h-full overflow-hidden">
            
            {/* LEFT WORKSPACE PANEL: Case details, Analysis brief & Chronology */}
            <div className="flex-1 flex flex-col overflow-y-auto p-6 gap-6">
              
              {/* Active Case Info Panel */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-md">
                      Active Matter
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 mt-3">{activeCase.title}</h1>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="capitalize">Type: {activeCase.caseType?.replace("_", " ") || "Eviction Notice"}</span>
                      <span>&bull;</span>
                      <span className="capitalize">Status: {activeCase.status}</span>
                    </div>
                  </div>
                  {activeCase.latestUrgency && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${activeCase.latestUrgency === "high" ? "bg-red-50 text-red-700 border border-red-200" : 
                        activeCase.latestUrgency === "medium" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" : 
                        "bg-green-50 text-green-700 border border-green-200"}`}
                    >
                      {activeCase.latestUrgency} Urgency
                    </span>
                  )}
                </div>
              </div>

              {/* Case Chronology Selector */}
              {activeCase.documents.length >= 1 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3 shrink-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    Case Chronology (Select Document to View Brief)
                  </span>
                  <div className="relative flex items-center justify-start gap-4 overflow-x-auto py-2">
                    <div className="absolute left-4 right-4 h-0.5 bg-gray-100 -z-10"></div>
                    {activeCase.documents.slice().reverse().map((doc, index) => {
                      const isSelected = selectedDocument?.id === doc.id;
                      const dateStr = new Date(doc.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
                      const docTypeName = doc.documentType?.replace("_", " ") || "Document";
                      
                      return (
                        <div key={doc.id} className="flex items-center">
                          <button
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`flex flex-col items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-xl border transition-all cursor-pointer relative z-10
                              ${isSelected 
                                ? "bg-gray-900 border-gray-900 text-white shadow-md scale-105" 
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50"}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]
                              ${isSelected ? "bg-white text-gray-900" : "bg-gray-100 text-gray-600"}`}>
                              {index + 1}
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-bold block capitalize leading-tight">{docTypeName}</span>
                              <span className="text-[9px] opacity-75">{dateStr}</span>
                            </div>
                          </button>
                          {index < activeCase.documents.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-300 mx-2 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Analysis View */}
              {analysis ? (
                <div className="space-y-6 pb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-gray-900" />
                      Case Dashboard & AI Analysis
                    </h2>
                    {analysis.processing?.model_used && (
                      <span className="text-xs bg-purple-50 border border-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                        Model: {analysis.processing.model_used}
                      </span>
                    )}
                  </div>

                  {/* Explanation card */}
                  {analysis.explanation && (
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-40 -z-10"></div>
                      <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Plain Language Briefing
                      </h3>
                      <p className="text-blue-900 font-semibold text-base leading-relaxed mb-4">{analysis.explanation.summary}</p>
                      {(analysis.explanation.bullet_points ?? analysis.explanation.simple_explanation) && (
                        <ul className="space-y-2">
                          {(analysis.explanation.bullet_points ?? analysis.explanation.simple_explanation).map((bp: string, i: number) => (
                            <li key={i} className="text-sm text-blue-800 flex items-start gap-2.5">
                              <span className="mt-1.5 block w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                              <span className="leading-relaxed">{bp}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Recommendations Actions card */}
                  {analysis.recommendations && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Immediate Checklist
                      </h3>
                      {immediateActionsList.length > 0 ? (
                        <ul className="space-y-3 mb-6">
                          {immediateActionsList.map((action: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-800 leading-relaxed">
                              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 mb-6 italic">No explicit immediate steps specified.</p>
                      )}
                      {analysis.recommendations.required_documents?.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-gray-100">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Suggested Evidentiary Files</span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.recommendations.required_documents.map((doc: string, i: number) => (
                              <span key={i} className="text-xs font-semibold px-3 py-1.5 bg-yellow-50/75 text-yellow-800 border border-yellow-200/50 rounded-lg">{doc}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extractions box */}
                  {analysis.extraction && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Extracted Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                          <div>
                            <span className="text-gray-400 font-medium block text-xs uppercase tracking-wider mb-2">Parties involved</span>
                            {analysis.extraction.names && analysis.extraction.names.length > 0 ? (
                              <div className="space-y-1.5">
                                {analysis.extraction.names.map((name: string, idx: number) => (
                                  <p key={idx} className="font-semibold text-gray-900 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                    {name}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic text-xs">No explicit names extracted</p>
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between">
                          <div>
                            <span className="text-gray-400 font-medium block text-xs uppercase tracking-wider mb-2">Chronology & Deadlines</span>
                            <div className="space-y-2">
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Document Dates</span>
                                {analysis.extraction.dates && analysis.extraction.dates.length > 0 ? (
                                  <p className="font-semibold text-gray-900">{analysis.extraction.dates.join(", ")}</p>
                                ) : (
                                  <p className="text-gray-500 italic text-xs">No explicit dates detected</p>
                                )}
                              </div>
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Deadlines</span>
                                {analysis.extraction.deadlines && analysis.extraction.deadlines.length > 0 ? (
                                  <p className="font-bold text-red-600 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {analysis.extraction.deadlines.join(", ")}
                                  </p>
                                ) : (
                                  <p className="text-gray-500 italic text-xs">No clear deadlines extracted</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {analysis.extraction.obligations?.length > 0 && (
                          <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-medium block text-xs uppercase tracking-wider mb-1">Subject Matter Obligations</span>
                            <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700">
                              {analysis.extraction.obligations.map((ob: string, i: number) => (
                                <li key={i}>{ob}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.extraction.risks && analysis.extraction.risks.length > 0 && (
                          <div className="col-span-1 md:col-span-2 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 space-y-1">
                            <span className="text-yellow-800 font-bold block text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                              Critical Risks Spelled Out
                            </span>
                            <ul className="list-disc pl-4 space-y-1 text-xs text-yellow-900 leading-relaxed">
                              {analysis.extraction.risks.map((risk: string, i: number) => (
                                <li key={i}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Defense strategy box */}
                  {analysis.defense && (analysis.defense.procedural_issues_spotted?.length > 0 || analysis.defense.defense_strategy) && (
                    <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 shadow-sm space-y-3">
                      <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600" /> Key Procedural Defenses Spelled Out
                      </h3>
                      {analysis.defense.procedural_issues_spotted?.length > 0 && (
                        <ul className="space-y-2">
                          {analysis.defense.procedural_issues_spotted.map((issue: any, i: number) => (
                            <li key={i} className="text-sm text-red-700 flex flex-col gap-0.5 leading-relaxed bg-white/60 p-3 rounded-xl border border-red-100/50">
                              <span className="font-bold text-xs text-red-800 uppercase tracking-wide">Defense Ground #{i+1}</span>
                              <span className="font-semibold text-gray-800">{typeof issue === "string" ? issue : issue.description}</span>
                              {issue.legal_basis && (
                                <span className="text-xs text-gray-500 italic mt-0.5">Legal Foundation: {issue.legal_basis}</span>
                              )}
                              {issue.action_item && (
                                <span className="text-xs text-blue-700 font-medium mt-1">Check: {issue.action_item}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {analysis.defense.defense_strategy && (
                        <div className="mt-3 pt-3 border-t border-red-200/50">
                          <span className="text-xs font-bold text-red-800 uppercase block tracking-wider mb-1">Defense Strategy Summary</span>
                          <p className="text-xs text-red-900 leading-relaxed font-medium">{analysis.defense.defense_strategy}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Grounded and disclaimer box */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Methodology:</span>
                      <span className="text-xs bg-gray-100 px-2.5 py-1 rounded font-semibold text-gray-700 capitalize">
                        {analysis.processing?.rag || "Direct Processing"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Confidence: {confidencePercent}%</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-xs text-gray-500 text-center leading-relaxed font-normal">
                    <strong>Disclaimer:</strong> {analysis.disclaimer?.message || analysis.disclaimer || "This tool provides AI-powered analysis as an educational reference. It does not constitute formal legal representation or professional legal advice. Consult a licensed advocate."}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-200 rounded-2xl border-dashed">
                  <Sparkles className="w-12 h-12 text-gray-300 mb-3 animate-pulse" />
                  <h3 className="text-base font-semibold text-gray-800">No legal brief generated yet</h3>
                  <p className="text-sm text-gray-500 max-w-sm mt-1">
                    Submit your document or case details in the chat panel to initialize analysis and construct your briefing.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: AI Chatbot & Attachment Interface */}
            <div className="w-full lg:w-[420px] flex flex-col bg-white border-l border-gray-200 shadow-sm overflow-hidden shrink-0">
              
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-gray-800" />
                  <div>
                    <span className="font-bold text-gray-800 text-sm block">Nyaya Assistant</span>
                    <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Live Legal AI
                    </span>
                  </div>
                </div>
                
                <select 
                  className="text-xs border border-gray-200 bg-white px-2 py-1 rounded focus:outline-none"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  <option value="en">English (EN)</option>
                  <option value="hi">Hindi (HI)</option>
                  <option value="ta">Tamil (TA)</option>
                  <option value="te">Telugu (TE)</option>
                  <option value="kn">Kannada (KN)</option>
                </select>
              </div>

              {/* Chat history list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3.5 bg-white border border-gray-200 rounded-2xl rounded-tl-none text-sm text-gray-700 leading-relaxed shadow-sm">
                    🧑‍⚖️ <strong>Welcome to your Case Portal!</strong>
                    <p className="mt-1">You can interact with me in two ways:</p>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-xs text-gray-500">
                      <li><strong>Ask Questions</strong>: Type normal questions to discuss next steps.</li>
                      <li><strong>Analyze Documents</strong>: Attach a file or paste legal notices/letters, then toggle "Analyze Document" mode.</li>
                    </ul>
                  </div>
                </div>

                {activeCase.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                      ${msg.role === "user" 
                        ? "bg-gray-900 text-white rounded-tr-none" 
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-75 font-semibold uppercase">
                        {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        {msg.role === "user" ? "You" : "Assistant"}
                      </div>
                      {msg.message}
                    </div>
                  </div>
                ))}

                {activeCase.events.map((evt) => (
                  <div key={evt.id} className="flex justify-center my-3">
                    <div className="text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200/50 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {evt.summary}
                    </div>
                  </div>
                ))}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom text inputs and file selector */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {attachedFile && (
                  <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-800 font-semibold animate-fade-rise">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{attachedFile.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setAttachedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        setInputMode("chat");
                      }}
                      className="p-1 hover:bg-blue-100 text-blue-800 rounded transition-all ml-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex bg-gray-100 p-1 rounded-xl mb-3 border border-gray-200">
                  <button
                    onClick={() => {
                      if (!attachedFile) setInputMode("chat");
                    }}
                    disabled={!!attachedFile}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${inputMode === "chat" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600 disabled:opacity-50"}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Ask AI Question
                  </button>
                  <button
                    onClick={() => setInputMode("analyze")}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${inputMode === "analyze" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <FileKey className="w-3.5 h-3.5" />
                    Analyze Document
                  </button>
                </div>

                <div className="relative border border-gray-300 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
                  <textarea
                    className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none pl-2 pr-10 pt-1 pb-10 min-h-[5rem] max-h-[12rem]"
                    placeholder={inputMode === "analyze" ? "Paste legal text or attach document below..." : "Ask your legal assistant anything..."}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isLoading}
                  />

                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-white pt-2 border-t border-gray-50">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="p-2 hover:bg-gray-100 text-gray-500 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
                      title="Attach legal document"
                    >
                      <Paperclip className="w-4 h-4" />
                      <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt"
                      />
                    </button>

                    <button
                      onClick={handleSend}
                      disabled={(!inputText.trim() && !attachedFile) || isLoading}
                      className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors disabled:opacity-40 disabled:hover:bg-gray-900 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          {inputMode === "analyze" ? "Run Analysis" : "Send message"}
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        )}
      </main>

    </div>
  );
}
