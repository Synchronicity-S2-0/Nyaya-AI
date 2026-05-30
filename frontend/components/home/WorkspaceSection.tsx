"use client";

import { useState, useRef, useEffect } from "react";

type TabId = "summary" | "resolution" | "insights" | "drafts" | "ask" | "history";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function WorkspaceSection() {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [tabHeights, setTabHeights] = useState<Record<string, number>>({});
  
  // Interactive Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "user",
      text: "What happens if I don't respond by the deadline?",
    },
    {
      id: "2",
      sender: "ai",
      text: "If you fail to respond by the October 5th deadline, the landlord may file for a default judgment. This means the court could rule in their favor without hearing your side, potentially leading to immediate eviction. It is crucial to file your response before this date.",
    },
    {
      id: "3",
      sender: "user",
      text: "Can you draft a quick extension request?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Interactive Draft State
  const [draftText, setDraftText] = useState(`[Date: October 1, 2026]

To: [Landlord Name]
Re: Notice of Eviction dated [Date of Notice]

Dear [Landlord Name],

I am writing in response to the eviction notice I received on [Date]. I have reviewed the terms of our lease agreement, specifically Section [X] regarding notice periods.

The agreement clearly states that a minimum of 30 days' notice must be provided prior to any eviction proceedings. The notice I received provides only 14 days, which is in direct violation of our agreed-upon terms.

Therefore, I consider the current notice to be invalid. I request that you retract this notice or provide a revised notice that complies with the terms of our lease agreement.

Sincerely,
[Your Name]`);

  // Tab Nav Refs for Indicator calculation
  const navContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Update animated tab indicator position
  useEffect(() => {
    const activeBtn = tabRefs.current[activeTab];
    const container = navContainerRef.current;
    if (activeBtn && container) {
      const activeRect = activeBtn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const left = activeRect.left - containerRect.left + container.scrollLeft;
      const width = activeRect.width;
      setIndicatorStyle({ left, width });
    }
  }, [activeTab]);

  // Handle Ask Nyaya chat submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgId = Date.now().toString();
    const newMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: chatInput,
    };

    setMessages((prev) => [...prev, newMsg]);
    const userQuery = chatInput;
    setChatInput("");
    setIsTyping(true);

    // AI Response Simulation
    setTimeout(() => {
      setIsTyping(false);
      let aiText = "Thank you for sharing. I'm analyzing that in relation to your case files. We should prepare standard documentation asserting Section 14 notice compliance.";
      
      const queryLower = userQuery.toLowerCase();
      if (queryLower.includes("extension") || queryLower.includes("draft")) {
        aiText = "Understood. I have drafted an official Letter of Extension Request. You can review it directly in the 'Drafts' tab. It requests a 14-day postponement of the eviction deadline to allow full legal consultation.";
      } else if (queryLower.includes("court") || queryLower.includes("sue")) {
        aiText = "If this escalates to court, we will file a formal counter-notice pointing out the procedural discrepancy. Our chances are solid (72% strength) due to the strict statutory timeline of the lease.";
      } else if (queryLower.includes("rent") || queryLower.includes("receipt")) {
        aiText = "Excellent question. Consistent rent receipts constitute proof of your compliance. Make sure to aggregate all payment records from June through September to defend against any failure-to-pay allegations.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: aiText,
        },
      ]);
    }, 1500);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === "ask") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, activeTab]);

  return (
    <section
      id="workspace"
      className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center py-20 bg-transparent"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
        <h2 className="font-serif text-display-lg-mobile md:text-display-lg text-primary mb-6">
          <i>
            <span className="block">A single workspace</span>
            <span className="block">
              for <span className="text-secondary">every legal situation.</span>
            </span>
          </i>
        </h2>
        <p className="font-sans text-body-lg text-secondary">
          Everything stays inside one living case.
        </p>
      </div>

      {/* Application Mockup with Traveling border glow wrapper */}
      <div className="w-full max-w-5xl relative group transition-transform duration-700 hover:scale-[1.005]">
        
        {/* Animated Glow Border */}
        <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-transparent via-orange-400/30 to-transparent blur-md opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none z-0" />

        <div className="relative w-full bg-white/75 dark:bg-neutral-900/75 backdrop-blur-[30px] border border-white/50 dark:border-neutral-800/50 rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-primary/5 z-10">
          
          {/* Mockup Header / Tab Nav */}
          <header className="w-full bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 px-6 md:px-10 py-6 relative">
            <div
              ref={navContainerRef}
              className="flex overflow-x-auto no-scrollbar gap-8 md:gap-12 pb-2 relative"
              id="tab-nav-container"
            >
              {(
                [
                  { id: "summary", title: "Summary" },
                  { id: "resolution", title: "Resolution" },
                  { id: "insights", title: "Legal Insights" },
                  { id: "drafts", title: "Drafts" },
                  { id: "ask", title: "Ask Nyaya" },
                  { id: "history", title: "History" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-link font-sans text-label-md uppercase tracking-wider whitespace-nowrap pb-2 cursor-pointer transition-colors duration-300 ${
                    activeTab === tab.id
                      ? "text-primary dark:text-white font-semibold"
                      : "text-secondary dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  }`}
                >
                  {tab.title}
                </button>
              ))}

              {/* Absolute Indicator Bar */}
              <div
                className="absolute bottom-0 h-[2px] bg-primary dark:bg-white transition-all duration-300 ease-out"
                style={{
                  transform: `translateX(${indicatorStyle.left}px)`,
                  width: `${indicatorStyle.width}px`,
                }}
              />
            </div>
          </header>

          {/* Mockup Content Canvas */}
          <div className="p-6 md:p-8 bg-white/40 dark:bg-neutral-950/40 min-h-[480px] flex flex-col justify-between">
            
            {/* Tab 1: Summary */}
            {activeTab === "summary" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div>
                  <h3 className="font-serif text-headline-md text-primary dark:text-white mb-2">Summary</h3>
                  <div className="h-px w-12 bg-primary dark:bg-white"></div>
                </div>
                <div className="max-w-3xl">
                  <p className="font-sans text-body-lg md:text-[22px] md:leading-[34px] text-on-surface dark:text-neutral-200">
                    Your landlord is requesting eviction. The notice period appears inconsistent with the terms outlined in the agreement.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Risk Level */}
                  <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl flex flex-col justify-between border border-neutral-200/60 dark:border-neutral-800 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
                    <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase tracking-widest mb-4 z-10 relative">Risk Level</span>
                    <div className="flex items-center gap-3 z-10 relative">
                      <span className="material-symbols-outlined text-red-600 select-none">warning</span>
                      <span className="font-serif text-headline-md text-primary dark:text-white">High</span>
                    </div>
                  </div>

                  {/* Card 2: Case Type */}
                  <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl flex flex-col justify-between border border-neutral-200/60 dark:border-neutral-800 relative overflow-hidden group">
                    <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase tracking-widest mb-4 z-10 relative">Case Type</span>
                    <div className="flex items-center gap-3 z-10 relative">
                      <span className="material-symbols-outlined text-primary dark:text-white select-none">home</span>
                      <span className="font-serif text-[20px] leading-[28px] text-primary dark:text-white">Property Dispute</span>
                    </div>
                  </div>

                  {/* Card 3: Important Dates */}
                  <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl flex flex-col justify-between border border-neutral-200/60 dark:border-neutral-800">
                    <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase tracking-widest mb-4">Important Dates</span>
                    <ul className="flex flex-col gap-3">
                      <li className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-2">
                        <span className="font-sans text-body-md text-secondary dark:text-neutral-400">Hearing</span>
                        <span className="font-sans text-body-md text-primary dark:text-white font-medium">Oct 12</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span className="font-sans text-body-md text-secondary dark:text-neutral-400">Deadline</span>
                        <span className="font-sans text-body-md text-red-600 font-medium">Oct 05</span>
                      </li>
                    </ul>
                  </div>

                  {/* Card 4: Recommended Action */}
                  <button
                    onClick={() => setActiveTab("drafts")}
                    className="bg-white dark:bg-neutral-900 p-6 rounded-xl flex flex-col justify-between border border-neutral-200/60 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-300 cursor-pointer group text-left"
                  >
                    <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase tracking-widest mb-4">Recommended Action</span>
                    <div className="flex items-center justify-between w-full">
                      <span className="font-sans text-body-lg text-primary dark:text-white font-medium">Draft Response</span>
                      <span className="material-symbols-outlined text-primary dark:text-white group-hover:translate-x-1 transition-transform select-none">arrow_forward</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Resolution */}
            {activeTab === "resolution" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div>
                  <h3 className="font-serif text-headline-md text-primary dark:text-white mb-2">Resolution Path</h3>
                  <div className="h-px w-12 bg-primary dark:bg-white"></div>
                </div>
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="flex-1">
                    <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-3 space-y-8 pb-4">
                      
                      {[
                        { date: "Today", desc: "Case Opened", active: true },
                        { date: "Pending", desc: "Collect Evidence", active: false },
                        { date: "Upcoming", desc: "Submit Response", active: false },
                        { date: "Next Phase", desc: "Await Review", active: false },
                        { date: "Final", desc: "Further Action", active: false },
                      ].map((step, idx) => (
                        <div key={idx} className="relative pl-8">
                          <div
                            className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-neutral-950 transition-colors duration-500 ${
                              step.active ? "bg-primary dark:bg-white" : "bg-neutral-300 dark:bg-neutral-700"
                            }`}
                          />
                          <h4 className="font-sans text-label-md text-secondary dark:text-neutral-400 uppercase tracking-widest mb-1">
                            {step.date}
                          </h4>
                          <p className="font-sans text-body-lg text-primary dark:text-white">{step.desc}</p>
                        </div>
                      ))}

                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase tracking-widest">Alternative Options</span>
                    
                    <button className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer flex justify-between items-center group text-left">
                      <span className="font-sans text-body-md text-primary dark:text-white">Negotiate Settlement</span>
                      <span className="material-symbols-outlined text-secondary group-hover:text-primary dark:group-hover:text-white transition-colors select-none">arrow_forward</span>
                    </button>

                    <button className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer flex justify-between items-center group text-left">
                      <span className="font-sans text-body-md text-primary dark:text-white">Request Extension</span>
                      <span className="material-symbols-outlined text-secondary group-hover:text-primary dark:group-hover:text-white transition-colors select-none">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Insights */}
            {activeTab === "insights" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-serif text-headline-md text-primary dark:text-white mb-2">Legal Insights</h3>
                    <div className="h-px w-12 bg-primary dark:bg-white"></div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase tracking-widest block mb-2">Case Strength</span>
                    
                    {/* Ring score */}
                    <div className="relative flex items-center justify-center w-16 h-16">
                      <svg className="absolute w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="rgba(0, 0, 0, 0.05)"
                          strokeWidth="4"
                          fill="transparent"
                          className="dark:stroke-neutral-800"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 26}
                          strokeDashoffset={2 * Math.PI * 26 * (1 - 0.72)}
                          fill="transparent"
                          className="text-primary dark:text-white"
                        />
                      </svg>
                      <span className="font-serif text-lg text-primary dark:text-white font-semibold">72%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-white text-lg select-none">lightbulb</span>
                      <span className="font-sans text-label-md text-primary dark:text-white uppercase tracking-widest font-semibold">Opportunity Detected</span>
                    </div>
                    <p className="font-sans text-body-md text-secondary dark:text-neutral-400">The landlord's notice was served 14 days prior, whereas the contract stipulates a 30-day minimum notice period.</p>
                  </div>

                  <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-white text-lg select-none">gavel</span>
                      <span className="font-sans text-label-md text-primary dark:text-white uppercase tracking-widest font-semibold">Procedural Concern</span>
                    </div>
                    <p className="font-sans text-body-md text-secondary dark:text-neutral-400">Ensure all communications are formally documented; previous informal texts may not hold up as legal notice.</p>
                  </div>

                  <div className="p-6 border border-neutral-200/60 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary dark:text-white text-lg select-none">description</span>
                      <span className="font-sans text-label-md text-primary dark:text-white uppercase tracking-widest font-semibold">Documentation Review</span>
                    </div>
                    <p className="font-sans text-body-md text-secondary dark:text-neutral-400">Missing recent rent receipts from your records. Obtaining these will strengthen your position against eviction claims.</p>
                  </div>

                  <div className="p-6 border border-red-200 dark:border-red-950/50 rounded-xl bg-red-500/5 flex flex-col gap-3 relative overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-600 text-lg select-none">warning</span>
                      <span className="font-sans text-label-md text-red-600 uppercase tracking-widest font-semibold">Risk Alert</span>
                    </div>
                    <p className="font-sans text-body-md text-neutral-800 dark:text-neutral-200">Failure to respond by Oct 05 will result in an automatic default judgment in favor of the landlord.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Drafts */}
            {activeTab === "drafts" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div className="flex justify-between items-end flex-wrap gap-4">
                  <div>
                    <h3 className="font-serif text-headline-md text-primary dark:text-white mb-2">Drafts</h3>
                    <div className="h-px w-12 bg-primary dark:bg-white"></div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-full font-sans text-label-md text-primary dark:text-white uppercase tracking-widest hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer">
                      Complaint
                    </button>
                    <button
                      onClick={() => {
                        const loadingText = "Generating draft reply...";
                        setDraftText(loadingText);
                        setTimeout(() => {
                          setDraftText(`[Date: October 1, 2026]
                          
To: [Landlord Name]
Re: Notice of Eviction Dispute Settlement Proposal

Dear [Landlord Name],

We have formally reviewed the Notice of Eviction dated September 20. As pointed out previously, the 14-day timeline served violates Section 8 (Minimum Notice Duration) of the lease.

However, in the interest of reaching an amicable settlement without legal escalation, I propose a lease restructuring or an extension of the vacancy timeline to 60 days, giving both parties sufficient time to transition.

Please let us know your availability for a conference call this coming Thursday.

Sincerely,
[Your Name]`);
                        }, 1200);
                      }}
                      className="px-4 py-2 bg-primary text-white dark:bg-white dark:text-black rounded-full font-sans text-label-md uppercase tracking-widest hover:opacity-95 cursor-pointer transition-opacity"
                    >
                      Generate Reply
                    </button>
                  </div>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 flex flex-col h-[400px]">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 p-4 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50 rounded-t-xl">
                    <span className="font-sans text-label-md text-primary dark:text-white uppercase tracking-widest font-semibold">Response To Eviction Notice</span>
                    <span className="material-symbols-outlined text-secondary dark:text-neutral-400 cursor-pointer hover:text-primary dark:hover:text-white select-none">more_horiz</span>
                  </div>
                  
                  {/* Editable textarea document canvas */}
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    className="p-8 outline-none border-none focus:ring-0 resize-none overflow-y-auto font-sans text-body-md text-secondary dark:text-neutral-300 bg-transparent flex-1 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Tab 5: Ask Nyaya */}
            {activeTab === "ask" && (
              <div className="flex flex-col gap-8 animate-fadeIn w-full">
                <div>
                  <h3 className="font-serif text-headline-md text-primary dark:text-white mb-2">Ask Nyaya</h3>
                  <div className="h-px w-12 bg-primary dark:bg-white"></div>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 flex flex-col h-[400px] w-full">
                  
                  {/* Chat logs container */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] p-4 rounded-xl text-body-md font-sans ${
                          msg.sender === "user"
                            ? "self-end bg-neutral-100 dark:bg-neutral-800 text-primary dark:text-white rounded-tr-none"
                            : "self-start bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-secondary dark:text-neutral-300 rounded-tl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                    ))}

                    {/* Chat Typing Animation */}
                    {isTyping && (
                      <div className="self-start bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-4 rounded-xl rounded-tl-none flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleChatSubmit} className="border-t border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900/50 rounded-b-xl flex gap-3 items-center">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask a question about your case..."
                      className="flex-1 bg-neutral-50 dark:bg-neutral-950 border-none outline-none focus:ring-0 font-sans text-body-md placeholder:text-secondary/40 text-black dark:text-white rounded-full px-5 py-2.5"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-primary text-white dark:bg-white dark:text-black flex items-center justify-center hover:opacity-90 cursor-pointer transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[20px] select-none">send</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab 6: History */}
            {activeTab === "history" && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                <div>
                  <h3 className="font-serif text-headline-md text-primary dark:text-white mb-2">Case History</h3>
                  <div className="h-px w-12 bg-primary dark:bg-white"></div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Property Dispute",
                      date: "Opened: Sep 15, 2026",
                      risk: "High Risk",
                      riskColor: "bg-red-500/10 text-red-600 border border-red-500/20",
                      icon: "home",
                      resolved: false,
                    },
                    {
                      title: "Employment Termination",
                      date: "Closed: Mar 10, 2026",
                      risk: "Resolved",
                      riskColor: "bg-neutral-100 dark:bg-neutral-800 text-secondary dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-800",
                      icon: "work",
                      resolved: true,
                    },
                    {
                      title: "Consumer Complaint",
                      date: "Closed: Nov 02, 2025",
                      risk: "Resolved",
                      riskColor: "bg-neutral-100 dark:bg-neutral-800 text-secondary dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-800",
                      icon: "shopping_cart",
                      resolved: true,
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border border-neutral-200/60 dark:border-neutral-800 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors ${
                        item.resolved ? "opacity-75" : "bg-white dark:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                          <span className="material-symbols-outlined text-primary dark:text-white text-lg select-none">
                            {item.icon}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-sans text-body-md text-primary dark:text-white font-medium">
                            {item.title}
                          </h4>
                          <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase tracking-widest">
                            {item.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-sans text-label-sm uppercase tracking-widest px-2 py-1 rounded ${item.riskColor}`}>
                          {item.risk}
                        </span>
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary dark:group-hover:text-white transition-colors select-none">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Closing Statement */}
      <div className="text-center mt-12">
        <p className="text-headline-md text-secondary dark:text-neutral-400 tracking-tight font-serif">
          One case. One conversation.{" "}
          <span className="text-primary dark:text-white font-semibold">Complete clarity.</span>
        </p>
      </div>

      {/* Tailwind fade-in animation keyframes inside custom style just in case */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
