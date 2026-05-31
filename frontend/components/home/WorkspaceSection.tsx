"use client";

import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Home,
  Briefcase,
  ShoppingCart,
  ArrowRight,
  ChevronRight,
  Lightbulb,
  Scale,
  FileText,
  MoreHorizontal,
  Send,
} from "lucide-react";

const TABS = [
  { id: "tab-summary", label: "Summary" },
  { id: "tab-resolution", label: "Resolution" },
  { id: "tab-insights", label: "Legal Insights" },
  { id: "tab-drafts", label: "Drafts" },
  { id: "tab-ask", label: "Ask Nyaya" },
  { id: "tab-history", label: "History" },
];

export function WorkspaceSection() {
  const [activeTab, setActiveTab] = useState("tab-summary");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  /* Chat state */
  const [messages, setMessages] = useState([
    { id: "1", sender: "user", text: "What happens if I don't respond by the deadline?" },
    {
      id: "2",
      sender: "ai",
      text: "If you fail to respond by the October 5th deadline, the landlord may file for a default judgment. This means the court could rule in their favor without hearing your side, potentially leading to immediate eviction. It is crucial to file your response before this date.",
    },
    { id: "3", sender: "user", text: "Can you draft a quick extension request?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* Draft state */
  const [draftText, setDraftText] = useState(
    `[Date]\n\nTo: [Landlord Name]\nRe: Notice of Eviction dated [Date of Notice]\n\nDear [Landlord Name],\n\nI am writing in response to the eviction notice I received on [Date]. I have reviewed the terms of our lease agreement, specifically Section [X] regarding notice periods.\n\nThe agreement clearly states that a minimum of 30 days' notice must be provided prior to any eviction proceedings. The notice I received provides only 14 days, which is in direct violation of our agreed-upon terms.\n\nTherefore, I consider the current notice to be invalid. I request that you retract this notice or provide a revised notice that complies with the terms of our lease agreement.\n\nSincerely,\n\n[Your Name]`
  );

  /* Tab indicator refs */
  const navContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* Recalculate indicator position */
  const updateIndicator = () => {
    const btn = tabRefs.current[activeTab];
    const container = navContainerRef.current;
    if (btn && container) {
      const btnRect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - containerRect.left + container.scrollLeft,
        width: btnRect.width,
      });
    }
  };

  useEffect(() => {
    // Small delay to ensure layout rendering is complete
    const timer = setTimeout(updateIndicator, 100);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  /* Scroll to bottom on new chat messages */
  useEffect(() => {
    if (activeTab === "tab-ask") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  /* Chat submit handler */
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userQuery = chatInput;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: userQuery },
    ]);
    setChatInput("");
    setIsTyping(true);
    setTimeout(() => {
      let aiText =
        "Thank you for sharing. I'm analysing that in relation to your case files. We should prepare documentation asserting Section 14 notice compliance.";
      const q = userQuery.toLowerCase();
      if (q.includes("extension") || q.includes("draft")) {
        aiText =
          "Understood. I have drafted an official Letter of Extension Request. You can review it in the 'Drafts' tab. It requests a 14-day postponement to allow full legal consultation.";
      } else if (q.includes("court") || q.includes("sue")) {
        aiText =
          "If this escalates to court, we will file a counter-notice pointing out the procedural discrepancy. Our chances are solid (72% strength) due to the statutory timeline of the lease.";
      }
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "ai", text: aiText },
      ]);
    }, 1500);
  };

  return (
    <section className="relative w-full min-h-screen pt-[120px] pb-section-gap flex flex-col items-center justify-center overflow-hidden bg-background text-on-background font-body-md antialiased selection:bg-surface-variant selection:text-primary">
      {/* Atmospheric Background */}
      <div className="atmospheric-glow" />

      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 font-instrument">
            <span className="block">A single workspace</span>
            <span className="block">
              for <span className="text-secondary font-light italic">every legal situation.</span>
            </span>
          </h2>
          <p className="font-body-lg text-body-lg text-secondary">
            Everything stays inside one living case.
          </p>
        </div>

        {/* Application Mockup */}
        <div className="w-full max-w-5xl glow-panel-wrapper transition-transform duration-700 hover:scale-[1.01]">
          <div className="w-full glass-panel rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-primary/5">
            {/* Mockup Header / Nav */}
            <header className="w-full bg-surface-container-lowest/50 border-b border-surface-variant px-6 md:px-10 py-6 relative">
              {/* Nav Component */}
              <div
                ref={navContainerRef}
                className="flex overflow-x-auto no-scrollbar gap-8 md:gap-12 pb-2 relative"
                id="tab-nav-container"
              >
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      ref={(el) => {
                        tabRefs.current[tab.id] = el;
                      }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`nav-link font-label-md text-label-md uppercase tracking-wider whitespace-nowrap pb-2 transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "active text-primary font-semibold"
                          : "text-secondary hover:text-primary"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                <div
                  className="tab-indicator"
                  id="tab-indicator"
                  style={{
                    transform: `translateX(${indicatorStyle.left}px)`,
                    width: `${indicatorStyle.width}px`,
                  }}
                />
              </div>
            </header>

            {/* Mockup Content Canvas */}
            <div
              className="p-6 bg-surface-container-lowest flex flex-col md:p-8 content-container h-[580px] md:h-[540px] overflow-y-auto"
              id="content-container"
            >
              {/* Tab 1: Summary */}
              {activeTab === "tab-summary" && (
                <div className="animate-fadeIn flex flex-col gap-8 w-full" id="tab-summary">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Summary</h3>
                    <div className="h-px w-12 bg-primary"></div>
                  </div>
                  <div className="max-w-3xl">
                    <p className="font-body-lg text-body-lg md:text-[24px] md:leading-[36px] text-on-surface">
                      Your landlord is requesting eviction. The notice period appears inconsistent with the terms outlined in the agreement.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Risk Level */}
                    <div className="bg-surface p-6 rounded-lg flex flex-col justify-between border border-surface-variant relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-error/10 blur-[40px] rounded-full transition-opacity duration-500 group-hover:opacity-100"></div>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 z-10 relative">Risk Level</span>
                      <div className="flex items-center gap-3 z-10 relative">
                        <AlertTriangle className="text-error fill-error" size={20} />
                        <span className="font-headline-md text-headline-md text-primary">High</span>
                      </div>
                    </div>
                    {/* Card 1b: Case Type */}
                    <div className="bg-surface p-6 rounded-lg flex flex-col justify-between border border-surface-variant relative overflow-hidden group">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 z-10 relative">Case Type</span>
                      <div className="flex items-center gap-3 z-10 relative">
                        <Home className="text-primary" size={20} />
                        <span className="font-headline-md text-[20px] leading-[28px] text-primary">Property Dispute</span>
                      </div>
                    </div>
                    {/* Card 3: Important Dates */}
                    <div className="bg-surface p-6 rounded-lg flex flex-col justify-between border border-surface-variant">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4">Important Dates</span>
                      <ul className="flex flex-col gap-3">
                        <li className="flex justify-between items-center border-b border-surface-variant pb-2">
                          <span className="font-body-md text-body-md text-secondary">Hearing</span>
                          <span className="font-body-md text-body-md text-primary font-medium">Oct 12</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="font-body-md text-body-md text-secondary">Deadline</span>
                          <span className="font-body-md text-body-md text-error font-medium">Oct 05</span>
                        </li>
                      </ul>
                    </div>
                    {/* Card 2: Recommended Action */}
                    <div
                      onClick={() => setActiveTab("tab-drafts")}
                      className="bg-surface p-6 rounded-lg flex flex-col justify-between border border-surface-variant hover:bg-surface-container-low transition-colors duration-300 cursor-pointer group"
                    >
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4">Recommended Action</span>
                      <div className="flex items-center justify-between">
                        <span className="font-body-lg text-body-lg text-primary font-medium">Draft Response</span>
                        <ArrowRight className="text-primary group-hover:translate-x-1 transition-transform" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Resolution */}
              {activeTab === "tab-resolution" && (
                <div className="animate-fadeIn flex flex-col gap-8 w-full" id="tab-resolution">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Resolution Path</h3>
                    <div className="h-px w-12 bg-primary"></div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-12">
                    <div className="flex-1">
                      <div className="relative border-l border-surface-variant ml-3 space-y-8 pb-4">
                        <div className="relative pl-8">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></div>
                          <h4 className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Today</h4>
                          <p className="font-body-lg text-body-lg text-primary">Case Opened</p>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant ring-4 ring-surface-container-lowest"></div>
                          <h4 className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Pending</h4>
                          <p className="font-body-lg text-body-lg text-primary">Collect Evidence</p>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant ring-4 ring-surface-container-lowest"></div>
                          <h4 className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Upcoming</h4>
                          <p className="font-body-lg text-body-lg text-primary">Submit Response</p>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant ring-4 ring-surface-container-lowest"></div>
                          <h4 className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Next Phase</h4>
                          <p className="font-body-lg text-body-lg text-primary">Await Review</p>
                        </div>
                        <div className="relative pl-8">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-surface-variant ring-4 ring-surface-container-lowest"></div>
                          <h4 className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-1">Final</h4>
                          <p className="font-body-lg text-body-lg text-primary">Further Action</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Alternative Options</span>
                      <div className="p-4 border border-surface-variant rounded-lg hover:bg-surface transition-colors cursor-pointer flex justify-between items-center group">
                        <span className="font-body-md text-body-md text-primary">Negotiate Settlement</span>
                        <ArrowRight className="text-secondary group-hover:text-primary transition-colors" size={20} />
                      </div>
                      <div className="p-4 border border-surface-variant rounded-lg hover:bg-surface transition-colors cursor-pointer flex justify-between items-center group">
                        <span className="font-body-md text-body-md text-primary">Request Extension</span>
                        <ArrowRight className="text-secondary group-hover:text-primary transition-colors" size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Insights */}
              {activeTab === "tab-insights" && (
                <div className="animate-fadeIn flex flex-col gap-8 w-full" id="tab-insights">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary mb-2">Legal Insights</h3>
                      <div className="h-px w-12 bg-primary"></div>
                    </div>
                    <div className="text-right">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest block mb-1">Case Strength</span>
                      <span className="font-headline-lg text-headline-lg text-primary">72%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-surface-variant rounded-lg bg-surface">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="text-primary" size={16} />
                        <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Opportunity Detected</span>
                      </div>
                      <p className="font-body-md text-body-md text-secondary">The landlord's notice was served 14 days prior, whereas the contract stipulates a 30-day minimum notice period.</p>
                    </div>
                    <div className="p-6 border border-surface-variant rounded-lg bg-surface">
                      <div className="flex items-center gap-2 mb-3">
                        <Scale className="text-primary" size={16} />
                        <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Procedural Concern</span>
                      </div>
                      <p className="font-body-md text-body-md text-secondary">Ensure all communications are formally documented; previous informal texts may not hold up as legal notice.</p>
                    </div>
                    <div className="p-6 border border-surface-variant rounded-lg bg-surface">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="text-primary" size={16} />
                        <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Documentation Review</span>
                      </div>
                      <p className="font-body-md text-body-md text-secondary">Missing recent rent receipts from your records. Obtaining these will strengthen your position against eviction claims.</p>
                    </div>
                    <div className="p-6 border border-error/20 rounded-lg bg-error/5 relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="text-error" size={16} />
                        <span className="font-label-md text-label-md text-error uppercase tracking-widest">Risk Alert</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface">Failure to respond by Oct 05 will result in an automatic default judgment in favor of the landlord.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Drafts */}
              {activeTab === "tab-drafts" && (
                <div className="animate-fadeIn flex flex-col gap-8 w-full" id="tab-drafts">
                  <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary mb-2">Drafts</h3>
                      <div className="h-px w-12 bg-primary"></div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-surface-variant rounded-full font-label-md text-label-md text-primary uppercase tracking-widest hover:bg-surface transition-colors cursor-pointer">Complaint</button>
                      <button
                        onClick={() => {
                          setDraftText("Generating draft reply...");
                          setTimeout(() => {
                            setDraftText(
                              `[Date: October 1, 2026]\n\nTo: [Landlord Name]\nRe: Notice of Eviction Dispute — Settlement Proposal\n\nDear [Landlord Name],\n\nWe have formally reviewed the Notice of Eviction dated September 20. As previously noted, the 14-day timeline served violates Section 8 (Minimum Notice Duration) of the lease.\n\nIn the interest of reaching an amicable settlement without legal escalation, I propose a lease restructuring or an extension of the vacancy timeline to 60 days, giving both parties sufficient time to transition.\n\nPlease let us know your availability for a conference call this coming Thursday.\n\nSincerely,\n\n[Your Name]`
                            );
                          }, 1200);
                        }}
                        className="px-4 py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md uppercase tracking-widest hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        Generate Reply
                      </button>
                    </div>
                  </div>
                  <div className="border border-surface-variant rounded-lg bg-surface flex flex-col h-[400px] overflow-hidden">
                    <div className="border-b border-surface-variant p-4 flex justify-between items-center bg-surface-container-lowest rounded-t-lg">
                      <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Response To Eviction Notice</span>
                      <MoreHorizontal className="text-secondary cursor-pointer hover:text-primary" size={18} />
                    </div>
                    <textarea
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      className="flex-1 p-8 outline-none resize-none font-body-md text-body-md text-secondary space-y-4 bg-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Tab 5: Ask Nyaya */}
              {activeTab === "tab-ask" && (
                <div className="animate-fadeIn flex flex-col gap-8 w-full" id="tab-ask">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Ask Nyaya</h3>
                    <div className="h-px w-12 bg-primary"></div>
                  </div>
                  <div className="border border-surface-variant rounded-lg bg-surface flex flex-col h-[400px] overflow-hidden">
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
                      {messages.map((msg) => {
                        const isUser = msg.sender === "user";
                        return (
                          <div
                            key={msg.id}
                            className={`max-w-[80%] p-4 rounded-lg ${
                              isUser
                                ? "self-end bg-surface-container rounded-tr-none text-primary"
                                : "self-start bg-surface-container-lowest border border-surface-variant rounded-tl-none text-secondary"
                            }`}
                          >
                            <p className="font-body-md text-body-md">{msg.text}</p>
                          </div>
                        );
                      })}
                      {isTyping && (
                        <div className="self-start bg-surface-container-lowest border border-surface-variant p-4 rounded-lg rounded-tl-none text-secondary flex gap-1 items-center">
                          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <form
                      onSubmit={handleChatSubmit}
                      className="border-t border-surface-variant p-4 bg-surface-container-lowest rounded-b-lg flex gap-3 items-center"
                    >
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-surface border-none focus:ring-0 font-body-md text-body-md placeholder:text-secondary/50 rounded-full px-4 py-2 text-primary"
                        placeholder="Ask a question about your case..."
                        type="text"
                      />
                      <button
                        type="submit"
                        className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        <Send size={20} />
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 6: History */}
              {activeTab === "tab-history" && (
                <div className="animate-fadeIn flex flex-col gap-8 w-full" id="tab-history">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Case History</h3>
                    <div className="h-px w-12 bg-primary"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border border-surface-variant rounded-lg bg-surface flex justify-between items-center group cursor-pointer hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center border border-surface-variant">
                          <Home className="text-primary" size={16} />
                        </div>
                        <div>
                          <h4 className="font-body-md text-body-md text-primary font-medium">Property Dispute</h4>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Opened: Sep 15, 2024</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-label-sm text-label-sm text-error uppercase tracking-widest bg-error/10 px-2 py-1 rounded">High Risk</span>
                        <ChevronRight className="text-secondary group-hover:text-primary transition-colors" size={16} />
                      </div>
                    </div>
                    <div className="p-4 border border-surface-variant rounded-lg bg-surface-container-lowest flex justify-between items-center group cursor-pointer hover:bg-surface-container-low transition-colors opacity-70">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-surface-variant">
                          <Briefcase className="text-secondary" size={16} />
                        </div>
                        <div>
                          <h4 className="font-body-md text-body-md text-secondary font-medium">Employment Termination</h4>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Closed: Mar 10, 2024</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest bg-surface-variant px-2 py-1 rounded">Resolved</span>
                        <ChevronRight className="text-secondary group-hover:text-primary transition-colors" size={16} />
                      </div>
                    </div>
                    <div className="p-4 border border-surface-variant rounded-lg bg-surface-container-lowest flex justify-between items-center group cursor-pointer hover:bg-surface-container-low transition-colors opacity-70">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-surface-variant">
                          <ShoppingCart className="text-secondary" size={16} />
                        </div>
                        <div>
                          <h4 className="font-body-md text-body-md text-secondary font-medium">Consumer Complaint</h4>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Closed: Nov 02, 2023</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest bg-surface-variant px-2 py-1 rounded">Resolved</span>
                        <ChevronRight className="text-secondary group-hover:text-primary transition-colors" size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="text-center mt-12">
          <p className="text-headline-md text-secondary tracking-tight font-display-lg">
            One case. One conversation. <span className="text-primary">Complete clarity.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
