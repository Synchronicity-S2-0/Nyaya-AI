"use client";

import { useState, useEffect } from "react";
import { Case, CaseDocument, CaseMessage, CaseEvent } from "@/app/generated/prisma/client";
import { 
  Bot, FileText, X, Paperclip, Send, Loader2, User, Calendar, Zap, MoreHorizontal, AlertTriangle, History, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

type CaseWithRelations = Case & {
  documents: CaseDocument[];
  messages: CaseMessage[];
  events: CaseEvent[];
};

interface CaseChatProps {
  activeCase: CaseWithRelations;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
  attachedFile: File | null;
  setAttachedFile: (file: File | null) => void;
  inputMode: "chat" | "analyze";
  setInputMode: (mode: "chat" | "analyze") => void;
  isLoading: boolean;
  handleSend: () => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  setActiveTab?: (tab: "summary" | "path" | "references" | "drafts") => void;
}

export default function CaseChat({
  activeCase,
  selectedLanguage,
  setSelectedLanguage,
  inputText,
  setInputText,
  attachedFile,
  setAttachedFile,
  inputMode,
  setInputMode,
  isLoading,
  handleSend,
  fileInputRef,
  handleFileChange,
  chatEndRef,
  setActiveTab,
}: CaseChatProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoMinimized, setAutoMinimized] = useState(false);

  const hasAssistantResponse = activeCase.messages?.some((m) => m.role === "assistant");

  useEffect(() => {
    // Reset toggle tracking when active case changes
    setAutoMinimized(false);
    setIsMinimized(false);
  }, [activeCase.id]);

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile && hasAssistantResponse && !autoMinimized) {
      setIsMinimized(true);
      setAutoMinimized(true);
    }
  }, [hasAssistantResponse, autoMinimized, activeCase.id]);
  
  // Custom message rendering to support standard bubbles and mockup warnings
  const renderMessage = (msg: CaseMessage) => {
    const isUser = msg.role === "user";

    if (isUser) {
      return (
        <div key={msg.id} className="flex justify-end items-start gap-3 pl-10">
          <div className="bg-gray-100 text-gray-800 text-sm leading-relaxed p-4 rounded-2xl rounded-tr-none shadow-sm font-sans font-medium">
            {msg.message}
          </div>
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 font-sans shadow-sm select-none">
            U
          </div>
        </div>
      );
    }

    // Check if the assistant message contains warning text or ignores
    const isWarning = msg.message.toLowerCase().includes("ignore") || 
                      msg.message.toLowerCase().includes("warning") ||
                      msg.message.toLowerCase().includes("weaken");

    if (isWarning) {
      return (
        <div key={msg.id} className="flex justify-start items-start gap-3 pr-8">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            <Bot className="w-4 h-4 text-gray-500" />
          </div>
          
          {/* Mockup Warning Card */}
          <div className="bg-white border border-gray-200/80 border-l-4 border-l-red-500 rounded-none p-5 shadow-sm font-sans text-sm flex flex-col gap-3 flex-grow animate-fadeIn">
            <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Strategic Warning</span>
            </div>
            
            <h4 className="text-gray-950 font-bold text-sm leading-snug">
              Ignoring the notice may weaken your legal position.
            </h4>
            
            <p className="text-gray-600 leading-relaxed text-xs">
              It is advisable to formally acknowledge receipt of the notice while explicitly disputing its timeline based on Section 4 of your lease agreement. Documenting your objection establishes a paper trail.
            </p>

            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setActiveTab?.("drafts")}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                Draft Objection
              </button>
              <button
                onClick={() => setActiveTab?.("references")}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                View Section 4
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Standard Assistant bubble
    return (
      <div key={msg.id} className="flex justify-start items-start gap-3 pr-10">
        
        <div className="bg-gray-50 border border-black/15 text-gray-700 text-sm leading-relaxed p-4 rounded-2xl rounded-tl-none shadow-sm font-sans font-medium">
          {msg.message}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "w-full lg:w-[420px] flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-gray-200 shadow-sm overflow-hidden shrink-0 transition-all duration-300",
      isMinimized ? "h-auto" : "flex-1 lg:flex-none lg:h-full"
    )}>
      
      {/* Chat panel Header */}
      <div className="p-5 border-b border-gray-200/80 flex items-center justify-between">
        
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
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-gray-800" />
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-gray-800">
            Ask Nyaya
          </span>
        </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="lg:hidden p-1 text-gray-500 hover:text-black transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
            aria-label={isMinimized ? "Expand chat" : "Collapse chat"}
          >
            {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat bubble list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
            
            {/* Welcome Message */}
            <div className="flex justify-start items-start gap-3 pr-10">
              
              <div className="bg-gray-50 border border-black/15 rounded-xl rounded-tl-none text-gray-700 text-sm leading-relaxed p-4 shadow-sm font-sans font-medium">
                <strong>Welcome to your Case Portal!</strong>
                <p className="mt-1">You can ask questions to discuss next steps, or request a reply draft objection citation directly from the dashboard.</p>
              </div>
            </div>

            {/* Real chat messages */}
            {activeCase.messages && activeCase.messages.map(renderMessage)}

            <div ref={chatEndRef} />
          </div>

          {/* Bottom text inputs and file selector */}
          <div className="p-6 border-t border-gray-100 bg-white">
            
            {/* File pill if attached */}
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
                  className="p-1 hover:bg-blue-100 text-blue-850 rounded transition-all ml-2 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-blue-800" />
                </button>
              </div>
            )}

            {/* Input Textarea Card */}
            <div className="relative border border-gray-200 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
              <textarea
                className="w-full text-sm text-gray-800 placeholder-gray-300 focus:outline-none resize-none pr-10 min-h-[3rem] max-h-[8rem]"
                placeholder="Ask about your case..."
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

              <button
                onClick={handleSend}
                disabled={(!inputText.trim() && !attachedFile) || isLoading}
                className="absolute bottom-4 right-4 p-2 bg-black hover:bg-gray-800 text-white rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-black cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Action triggers below input card */}
            <div className="flex items-center justify-between mt-4 text-xs font-semibold text-gray-400 select-none">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
                <span>Add context</span>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </button>

              <button 
                onClick={() => setInputMode(inputMode === "chat" ? "analyze" : "chat")}
                className="flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer"
              >
                <History className="w-4 h-4" />
                <span>{inputMode === "analyze" ? "Direct Chat" : "Analyze mode"}</span>
              </button>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
