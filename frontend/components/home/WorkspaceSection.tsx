"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

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
  const navContainerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeBtnRef.current && indicatorRef.current && navContainerRef.current) {
      const btnRect = activeBtnRef.current.getBoundingClientRect();
      const containerRect = navContainerRef.current.getBoundingClientRect();
      const leftPos = btnRect.left - containerRect.left + navContainerRef.current.scrollLeft;
      
      indicatorRef.current.style.transform = `translateX(${leftPos}px)`;
      indicatorRef.current.style.width = `${btnRect.width}px`;
    }
  }, [activeTab]);

  return (
    <main className="relative min-h-screen py-section-gap flex flex-col items-center justify-center bg-background text-on-background">
      <div className="atmospheric-glow"></div>
      <section className="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center" id="workspace">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary mb-6">
            <i>
              <span className="block">A single workspace</span>
              <span className="block">for <span className="text-secondary">every legal situation.</span></span>
            </i>
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
                      ref={isActive ? activeBtnRef : null}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "nav-link font-label-md text-label-md uppercase tracking-wider whitespace-nowrap pb-2 transition-colors duration-300",
                        isActive ? "active text-primary font-semibold" : "text-secondary hover:text-primary"
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
                <div ref={indicatorRef} className="tab-indicator"></div>
              </div>
            </header>

            {/* Mockup Content Canvas */}
            <div className="p-6 bg-surface-container-lowest flex flex-col md:p-8 content-container min-h-[400px]">
              
              {/* Tab 1: Summary */}
              {activeTab === "tab-summary" && (
                <div className="flex-col gap-8 flex animate-fade-rise">
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
                    <div className="bg-surface p-6 rounded-lg flex flex-col justify-between border border-surface-variant relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-error/10 blur-[40px] rounded-full transition-opacity duration-500 group-hover:opacity-100"></div>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 z-10 relative">Risk Level</span>
                      <div className="flex items-center gap-3 z-10 relative">
                        <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        <span className="font-headline-md text-headline-md text-primary">High</span>
                      </div>
                    </div>
                    <div className="bg-surface p-6 rounded-lg flex flex-col justify-between border border-surface-variant relative overflow-hidden group">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4 z-10 relative">Case Type</span>
                      <div className="flex items-center gap-3 z-10 relative">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                        <span className="font-headline-md text-[20px] leading-[28px] text-primary">Property Dispute</span>
                      </div>
                    </div>
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
                    <div className="bg-surface p-6 rounded-lg flex flex-col justify-between border border-surface-variant hover:bg-surface-container-low transition-colors duration-300 cursor-pointer group">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-4">Recommended Action</span>
                      <div className="flex items-center justify-between">
                        <span className="font-body-lg text-body-lg text-primary font-medium">Draft Response</span>
                        <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Resolution */}
              {activeTab === "tab-resolution" && (
                <div className="flex-col gap-8 flex animate-fade-rise">
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
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Alternative Options</span>
                      <div className="p-4 border border-surface-variant rounded-lg hover:bg-surface transition-colors cursor-pointer flex justify-between items-center group">
                        <span className="font-body-md text-body-md text-primary">Negotiate Settlement</span>
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">arrow_forward</span>
                      </div>
                      <div className="p-4 border border-surface-variant rounded-lg hover:bg-surface transition-colors cursor-pointer flex justify-between items-center group">
                        <span className="font-body-md text-body-md text-primary">Request Extension</span>
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Insights */}
              {activeTab === "tab-insights" && (
                <div className="flex-col gap-8 flex animate-fade-rise">
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
                        <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
                        <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Opportunity Detected</span>
                      </div>
                      <p className="font-body-md text-body-md text-secondary">The landlord's notice was served 14 days prior, whereas the contract stipulates a 30-day minimum notice period.</p>
                    </div>
                    <div className="p-6 border border-error/20 rounded-lg bg-error/5 relative overflow-hidden">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-error text-sm">warning</span>
                        <span className="font-label-md text-label-md text-error uppercase tracking-widest">Risk Alert</span>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface">Failure to respond by Oct 05 will result in an automatic default judgment in favor of the landlord.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Drafts */}
              {activeTab === "tab-drafts" && (
                <div className="flex-col gap-8 flex animate-fade-rise">
                  <div className="flex justify-between items-end flex-wrap gap-4">
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary mb-2">Drafts</h3>
                      <div className="h-px w-12 bg-primary"></div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-surface-variant rounded-full font-label-md text-label-md text-primary uppercase tracking-widest hover:bg-surface transition-colors cursor-pointer">Complaint</button>
                      <button className="px-4 py-2 bg-primary text-on-primary rounded-full font-label-md text-label-md uppercase tracking-widest hover:bg-primary/90 transition-colors cursor-pointer">Generate Reply</button>
                    </div>
                  </div>
                  <div className="border border-surface-variant rounded-lg bg-surface flex flex-col h-[400px]">
                    <div className="border-b border-surface-variant p-4 flex justify-between items-center bg-surface-container-lowest rounded-t-lg">
                      <span className="font-label-md text-label-md text-primary uppercase tracking-widest">Response To Eviction Notice</span>
                      <span className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary">more_horiz</span>
                    </div>
                    <div className="p-8 overflow-y-auto font-body-md text-body-md text-secondary space-y-4">
                      <p><strong>[Date]</strong></p>
                      <p><strong>To:</strong> [Landlord Name]</p>
                      <p><strong>Re:</strong> Notice of Eviction dated [Date of Notice]</p>
                      <p>Dear [Landlord Name],</p>
                      <p>I am writing in response to the eviction notice I received on [Date]. I have reviewed the terms of our lease agreement, specifically Section [X] regarding notice periods.</p>
                      <p>The agreement clearly states that a minimum of 30 days' notice must be provided prior to any eviction proceedings. The notice I received provides only 14 days, which is in direct violation of our agreed-upon terms.</p>
                      <p>Therefore, I consider the current notice to be invalid. I request that you retract this notice or provide a revised notice that complies with the terms of our lease agreement.</p>
                      <p>Sincerely,</p>
                      <p>[Your Name]</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Ask Nyaya */}
              {activeTab === "tab-ask" && (
                <div className="flex-col gap-8 flex animate-fade-rise">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Ask Nyaya</h3>
                    <div className="h-px w-12 bg-primary"></div>
                  </div>
                  <div className="border border-surface-variant rounded-lg bg-surface flex flex-col h-[400px]">
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col">
                      <div className="self-end max-w-[80%] bg-surface-container p-4 rounded-lg rounded-tr-none">
                        <p className="font-body-md text-body-md text-primary">What happens if I don't respond by the deadline?</p>
                      </div>
                      <div className="self-start max-w-[80%] bg-surface-container-lowest border border-surface-variant p-4 rounded-lg rounded-tl-none">
                        <p className="font-body-md text-body-md text-secondary">If you fail to respond by the October 5th deadline, the landlord may file for a default judgment. This means the court could rule in their favor without hearing your side, potentially leading to immediate eviction.</p>
                      </div>
                    </div>
                    <div className="border-t border-surface-variant p-4 bg-surface-container-lowest rounded-b-lg flex gap-3 items-center">
                      <input className="flex-1 bg-surface border-none focus:outline-none focus:ring-0 font-body-md text-body-md placeholder:text-secondary/50 rounded-full px-4 py-2" placeholder="Ask a question about your case..." type="text" />
                      <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>send</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: History */}
              {activeTab === "tab-history" && (
                <div className="flex-col gap-8 flex animate-fade-rise">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-primary mb-2">Case History</h3>
                    <div className="h-px w-12 bg-primary"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 border border-surface-variant rounded-lg bg-surface flex justify-between items-center group cursor-pointer hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center border border-surface-variant">
                          <span className="material-symbols-outlined text-primary text-sm">home</span>
                        </div>
                        <div>
                          <h4 className="font-body-md text-body-md text-primary font-medium">Property Dispute</h4>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Opened: Sep 15, 2024</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-label-sm text-label-sm text-error uppercase tracking-widest bg-error/10 px-2 py-1 rounded">High Risk</span>
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">chevron_right</span>
                      </div>
                    </div>
                    <div className="p-4 border border-surface-variant rounded-lg bg-surface-container-lowest flex justify-between items-center group cursor-pointer hover:bg-surface-container-low transition-colors opacity-70">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-surface-variant">
                          <span className="material-symbols-outlined text-secondary text-sm">work</span>
                        </div>
                        <div>
                          <h4 className="font-body-md text-body-md text-secondary font-medium">Employment Termination</h4>
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Closed: Mar 10, 2024</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest bg-surface-variant px-2 py-1 rounded">Resolved</span>
                        <span className="material-symbols-outlined text-secondary group-hover:text-primary transition-colors">chevron_right</span>
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

      </section>
    </main>
  );
}
