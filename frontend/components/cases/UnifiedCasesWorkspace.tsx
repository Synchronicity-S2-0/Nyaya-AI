"use client";

import { useState, useRef, useEffect } from "react";
import { Case, CaseDocument, CaseMessage, CaseEvent } from "@/app/generated/prisma/client";
import { analyzeCaseText, analyzeCaseFile, sendCaseMessage } from "@/lib/api-client";
import { saveDocumentAnalysis, saveChatInteraction } from "@/app/cases/[caseId]/actions";
import { createNewCaseAction, closeCaseAction } from "@/app/cases/actions";
import { Loader2, FolderOpen } from "lucide-react";

import MattersSidebar from "./MattersSidebar";
import NewCaseWizard from "./NewCaseWizard";
import CaseDetails from "./CaseDetails";
import CaseChat from "./CaseChat";

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
  
  // Mobile drawer open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active case workspace states
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"chat" | "analyze">("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "path" | "references" | "drafts">("summary");

  // New Case wizard states
  const [wizardText, setWizardText] = useState("");
  const [wizardFile, setWizardFile] = useState<File | null>(null);

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
    setActiveTab("summary");
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

  const handleWizardSubmit = async (customText?: string, customFile?: File | null) => {
    const textToSubmit = (customText !== undefined ? customText : wizardText).trim();
    const fileToSubmit = customFile !== undefined ? customFile : wizardFile;

    if (!textToSubmit && !fileToSubmit) return;

    setIsLoading(true);
    try {
      const rawText = textToSubmit;
      const caseTitle = fileToSubmit 
        ? fileToSubmit.name.replace(/\.[^/.]+$/, "").substring(0, 30)
        : rawText.length > 0 
          ? rawText.substring(0, 30) + (rawText.length > 30 ? "..." : "")
          : "New Consultation";
      
      const newCase = await createNewCaseAction(caseTitle);

      let result;
      if (fileToSubmit) {
        const mockFileUrl = "https://example.com/mock-file.pdf";
        result = await analyzeCaseFile(
          newCase.id,
          userId,
          fileToSubmit,
          mockFileUrl,
          undefined,
          selectedLanguage
        );
      } else {
        result = await analyzeCaseText(
          newCase.id,
          userId,
          textToSubmit,
          undefined,
          selectedLanguage
        );
      }

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


  const handleCloseCase = async () => {
    if (!activeCase) return;
    setIsClosing(true);
    try {
      const result = await closeCaseAction(activeCase.id);
      if (result.success) {
        setCases((prevCases) =>
          prevCases.map((c) => {
            if (c.id === activeCase.id) {
              const closeEvent: CaseEvent = {
                id: `evt-close-${Date.now()}`,
                caseId: c.id,
                userId,
                eventType: "analysis_completed" as any, // using analysis_completed as fallback enum value
                summary: "Case was marked as closed",
                metadataJson: {},
                createdAt: new Date(),
              };
              return {
                ...c,
                status: "closed",
                events: [closeEvent, ...c.events],
                updatedAt: new Date(),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to close case. Please try again.");
    } finally {
      setIsClosing(false);
    }
  };

  const rawConfidence = analysis?.classification?.confidence_score ?? analysis?.classification?.confidence;
  const confidencePercent = typeof rawConfidence === "number" 
    ? (rawConfidence * 100).toFixed(0) 
    : "100";

  const immediateActionsList = analysis?.recommendations?.next_steps ?? analysis?.recommendations?.immediate_actions ?? [];

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
      
      {/* Mobile Sidebar Drawer Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/30 z-35 transition-opacity animate-fadeIn" 
        />
      )}

      {/* 1. LEFT SIDEBAR: Cases list history */}
      <MattersSidebar
        cases={cases}
        selectedCaseId={selectedCaseId}
        setSelectedCaseId={setSelectedCaseId}
        session={session}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. CENTRAL PANEL & DYNAMIC CONTENT */}
      <main className="flex-1 md:ml-[320px] bg-gray-50 flex flex-col h-full overflow-hidden">
        
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
          <h1 className="font-instrument italic text-2xl text-primary">Nyaya AI</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-black rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Matters</span>
          </button>
        </div>

        {selectedCaseId === null ? (
          
          // ================= STATE A: NEW CASE DEFAULT WIZARD =================
          <NewCaseWizard
            wizardText={wizardText}
            setWizardText={setWizardText}
            wizardFile={wizardFile}
            setWizardFile={setWizardFile}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            isLoading={isLoading}
            handleWizardSubmit={handleWizardSubmit}
            wizardFileInputRef={wizardFileInputRef}
          />
        ) : activeCase ? (
          
          // ================= STATE B: ACTIVE CASE WORKSPACE =================
          <div className="flex-1 flex flex-col lg:flex-row gap-0 h-full overflow-hidden">
            
            {/* LEFT WORKSPACE PANEL: Case details, Analysis brief & Chronology */}
            <CaseDetails
              activeCase={activeCase}
              selectedDocId={selectedDocId}
              setSelectedDocId={setSelectedDocId}
              selectedDocument={selectedDocument}
              analysis={analysis}
              confidencePercent={confidencePercent}
              immediateActionsList={immediateActionsList}
              onCloseCase={handleCloseCase}
              isClosing={isClosing}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* RIGHT PANEL: AI Chatbot & Attachment Interface */}
            <CaseChat
              activeCase={activeCase}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              inputText={inputText}
              setInputText={setInputText}
              attachedFile={attachedFile}
              setAttachedFile={setAttachedFile}
              inputMode={inputMode}
              setInputMode={setInputMode}
              isLoading={isLoading}
              handleSend={handleSend}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              chatEndRef={chatEndRef}
              setActiveTab={setActiveTab}
            />

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
