"use client";

import { useRef } from "react";
import { FileText, Image as ImageIcon, ArrowRight, Loader2, X } from "lucide-react";
import useTextStore from "@/store/useText";

interface NewCaseWizardProps {
  wizardText: string;
  setWizardText: (text: string) => void;
  wizardFile: File | null;
  setWizardFile: (file: File | null) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  isLoading: boolean;
  handleWizardSubmit: (customText?: string, customFile?: File) => Promise<void>;
  wizardFileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function NewCaseWizard({
  wizardText,
  setWizardText,
  wizardFile,
  setWizardFile,
  selectedLanguage,
  setSelectedLanguage,
  isLoading,
  handleWizardSubmit,
  wizardFileInputRef,
}: NewCaseWizardProps) {
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { text, setText } = useTextStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setWizardFile(e.target.files[0]);
    }
  };

  const handleStarterClick = (starterText: string) => {
    setText(starterText);
    setWizardText(starterText);
  };

  const onSubmit = () => {
    handleWizardSubmit(wizardText || text, wizardFile || undefined);
  };

  return (
    <div className="flex-grow relative h-screen overflow-y-auto custom-scrollbar flex flex-col items-center justify-center pt-10 pb-20 px-6 md:px-0 bg-[#FAFAF8]">
      {/* Ambient background glow */}
      <div className="absolute w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(245,_222,_179,_0.15)_0%,_rgba(250,_250,_248,_0)_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>

      {/* Central container */}
      <div className="w-full max-w-3xl z-10 flex flex-col items-center text-center space-y-10 animate-fadeIn">
        
        {/* Header section */}
        <div className="space-y-4">
          <span className="font-sans text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase block">
            Legal Resolution Workspace
          </span>
          <h2 className="font-serif text-5xl md:text-7xl text-gray-900 leading-tight font-medium">
            How would you like us to help?
          </h2>
          <p className="font-sans text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Describe your situation naturally. We will help you understand your rights, assess risks, and draft necessary responses through guided conversation.
          </p>
        </div>

        {/* Unified Input Card area */}
        <div className="w-full glow-panel-wrapper transition-transform duration-700 hover:scale-[1.01]">
          <div className="w-full bg-white rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-200/60 relative transition-all duration-300 focus-within:shadow-[0_8px_40px_rgba(0,0,0,0.08)] focus-within:border-gray-300">
            
            {/* File pill if uploaded */}
            {wizardFile && (
              <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 text-[10px] font-bold px-3 py-1.5 rounded-full border border-blue-200 w-fit mt-2 ml-4">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[200px]">{wizardFile.name}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setWizardFile(null);
                    if (wizardFileInputRef.current) wizardFileInputRef.current.value = "";
                  }}
                  className="hover:bg-blue-100 p-0.5 rounded ml-1 cursor-pointer"
                >
                  <X className="w-3 h-3 text-blue-800" />
                </button>
              </div>
            )}

            <textarea 
              className="w-full bg-transparent border-none resize-none focus:ring-0 font-sans text-base text-gray-800 placeholder-gray-300 p-6 min-h-[140px] focus:outline-none"
              placeholder="Describe your legal issue here..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setWizardText(e.target.value);
              }}
              disabled={isLoading}
            />

            {/* Hidden inputs */}
            <input
              type="file"
              ref={wizardFileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
            />
            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />

            {/* Bottom input actions */}
            <div className="flex flex-wrap gap-3 justify-between items-center p-2 mt-2">
              <div className="flex flex-wrap gap-1.5 items-center">
                <button 
                  type="button"
                  onClick={() => wizardFileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2 sm:p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors group cursor-pointer"
                  title="Upload Document"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
                </button>
                <button 
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2 sm:p-3 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors group cursor-pointer"
                  title="Upload Image"
                >
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform" />
                </button>

                <div className="flex items-center gap-2 ml-1 sm:ml-2">
                  <select
                    className="text-[11px] sm:text-xs border border-gray-200 bg-white px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg focus:outline-none"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="ta">Tamil (TA)</option>
                    <option value="te">Telugu (TE)</option>
                    <option value="kn">Kannada (KN)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={onSubmit}
                disabled={(!wizardText.trim() && !wizardFile && !text.trim()) || isLoading}
                className="bg-black text-white rounded-full px-4 sm:px-8 py-2.5 sm:py-3 font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors duration-300 flex items-center gap-1.5 sm:gap-2 shadow-sm disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Starters */}
        <div className="w-full mt-4 space-y-4">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => handleStarterClick("I received an eviction notice")}
              className="px-5 py-3 rounded-full border border-gray-200 text-gray-500 font-sans text-sm hover:border-black hover:text-black transition-colors bg-white/50 backdrop-blur-sm shadow-sm cursor-pointer"
            >
              "I received an eviction notice"
            </button>
            <button
              type="button"
              onClick={() => handleStarterClick("My employer terminated me without notice")}
              className="px-5 py-3 rounded-full border border-gray-200 text-gray-500 font-sans text-sm hover:border-black hover:text-black transition-colors bg-white/50 backdrop-blur-sm shadow-sm cursor-pointer"
            >
              "My employer terminated me without notice"
            </button>
            <button
              type="button"
              onClick={() => handleStarterClick("I was charged for a service I never received")}
              className="px-5 py-3 rounded-full border border-gray-200 text-gray-500 font-sans text-sm hover:border-black hover:text-black transition-colors bg-white/50 backdrop-blur-sm shadow-sm cursor-pointer"
            >
              "I was charged for a service I never received"
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
