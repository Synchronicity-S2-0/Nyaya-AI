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

type TabId = "summary" | "resolution" | "insights" | "drafts" | "ask" | "history";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

const TABS = [
  { id: "summary" as TabId, title: "Summary" },
  { id: "resolution" as TabId, title: "Resolution" },
  { id: "insights" as TabId, title: "Legal Insights" },
  { id: "drafts" as TabId, title: "Drafts" },
  { id: "ask" as TabId, title: "Ask Nyaya" },
  { id: "history" as TabId, title: "History" },
];

/* ─── Exact font style tokens from the HTML tailwind config ─── */
const F = {
  displayLg: {
    fontFamily: "var(--font-serif), 'Instrument Serif', serif",
    fontSize: "clamp(48px, 6vw, 80px)",
    lineHeight: "clamp(52px, 6.6vw, 88px)",
    letterSpacing: "-0.02em",
    fontWeight: 400,
  },
  headlineMd: {
    fontFamily: "var(--font-serif), 'Instrument Serif', serif",
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: 400,
  },
  headlineLg: {
    fontFamily: "var(--font-serif), 'Instrument Serif', serif",
    fontSize: "40px",
    lineHeight: "48px",
    letterSpacing: "-0.01em",
    fontWeight: 400,
  },
  bodyLg: {
    fontFamily: "var(--font-sans), Inter, sans-serif",
    fontSize: "18px",
    lineHeight: "28px",
    letterSpacing: "0.01em",
    fontWeight: 400,
  },
  bodyMd: {
    fontFamily: "var(--font-sans), Inter, sans-serif",
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 400,
  },
  labelMd: {
    fontFamily: "var(--font-sans), Inter, sans-serif",
    fontSize: "12px",
    lineHeight: "16px",
    letterSpacing: "0.1em",
    fontWeight: 500,
  },
  labelSm: {
    fontFamily: "var(--font-sans), Inter, sans-serif",
    fontSize: "10px",
    lineHeight: "14px",
    letterSpacing: "0.05em",
    fontWeight: 600,
  },
} as const;

export function WorkspaceSection() {
  const [activeTab, setActiveTab] = useState<TabId>("summary");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  /* Chat state */
  const [messages, setMessages] = useState<Message[]>([
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
    `[Date]\n\nTo: [Landlord Name]\nRe: Notice of Eviction dated [Date of Notice]\n\nDear [Landlord Name],\n\nI am writing in response to the eviction notice I received on [Date]. I have reviewed the terms of our lease agreement, specifically Section [X] regarding notice periods.\n\nThe agreement clearly states that a minimum of 30 days' notice must be provided prior to any eviction proceedings. The notice I received provides only 14 days, which is in direct violation of our agreed-upon terms.\n\nTherefore, I consider the current notice to be invalid. I request that you retract this notice or provide a revised notice that complies with the terms of our lease agreement.\n\nSincerely,\n[Your Name]`
  );

  /* Tab indicator refs */
  const navContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  /* Recalculate indicator whenever active tab changes */
  useEffect(() => {
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
  }, [activeTab]);

  /* Scroll to bottom on new chat messages */
  useEffect(() => {
    if (activeTab === "ask") {
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
      if (q.includes("extension") || q.includes("draft"))
        aiText =
          "Understood. I have drafted an official Letter of Extension Request. You can review it in the 'Drafts' tab. It requests a 14-day postponement to allow full legal consultation.";
      else if (q.includes("court") || q.includes("sue"))
        aiText =
          "If this escalates to court, we will file a counter-notice pointing out the procedural discrepancy. Our chances are solid (72% strength) due to the statutory timeline of the lease.";
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: "ai", text: aiText },
      ]);
    }, 1500);
  };

  return (
    <>
      {/* ── Scoped styles matching HTML exactly ── */}
      <style>{`
        .ws-glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
        }
        .ws-atmospheric-glow {
          position: absolute;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(255, 237, 213, 0.4) 0%, rgba(249, 249, 251, 0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
          pointer-events: none;
        }
        /* Spinning conic-gradient border glow */
        @property --ws-border-angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes ws-bg-spin {
          to { --ws-border-angle: 360deg; }
        }
        .ws-glow-wrapper {
          position: relative;
          z-index: 10;
        }
        .ws-glow-wrapper::before {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 1.25rem;
          background: conic-gradient(
            from var(--ws-border-angle, 0deg),
            transparent 0%,
            transparent 30%,
            rgba(255, 158, 64, 0.8) 50%,
            transparent 70%,
            transparent 100%
          );
          z-index: -1;
          animation: ws-bg-spin 8s linear infinite;
          filter: blur(12px);
          opacity: 0.9;
        }
        /* Tab content fade-in */
        @keyframes ws-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ws-tab-fade {
          animation: ws-fade-in 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        /* Hide scrollbar for tab nav */
        .ws-no-scrollbar::-webkit-scrollbar { display: none; }
        .ws-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <section
        id="workspace"
        className="relative overflow-x-hidden"
        style={{
          background: "linear-gradient(180deg, #f9f9fb 0%, #fff8f4 50%, #f9f9fb 100%)",
          paddingTop: "120px",
          paddingBottom: "160px",
        }}
      >
        {/* Atmospheric glow background */}
        <div className="ws-atmospheric-glow" />

        <div
          className="relative z-10 w-full flex flex-col items-center"
          style={{
            maxWidth: "1440px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "clamp(24px, 5.5vw, 80px)",
            paddingRight: "clamp(24px, 5.5vw, 80px)",
          }}
        >
          {/* ── Section Header ── */}
          <div
            className="text-center mx-auto"
            style={{ maxWidth: "700px", marginBottom: "clamp(64px, 7vw, 112px)" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif), 'Instrument Serif', serif",
                fontSize: "clamp(42px, 6.5vw, 80px)",
                lineHeight: "clamp(46px, 7vw, 88px)",
                letterSpacing: "-0.02em",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#000",
                marginBottom: "20px",
              }}
            >
              <span style={{ display: "block" }}>A single workspace</span>
              <span style={{ display: "block" }}>
                for{" "}
                <span style={{ color: "#5e5e5e" }}>every legal situation.</span>
              </span>
            </h2>
            {/* Colorful subtext — each word has its own warm/cool accent */}
            <p style={{ fontFamily: "var(--font-sans), Inter, sans-serif", fontSize: "16px", lineHeight: "24px", fontWeight: 400 }}>
              <span style={{ color: "#c4612a" }}>Everything</span>{" "}
              <span style={{ color: "#5e5e5e" }}>stays</span>{" "}
              <span style={{ color: "#2a7c8e" }}>inside</span>{" "}
              <span style={{ color: "#5e5e5e" }}>one</span>{" "}
              <span style={{ color: "#c4612a" }}>living</span>{" "}
              <span style={{ color: "#5e5e5e" }}>case.</span>
            </p>
          </div>

          {/* ── Application Mockup ── */}
          <div
            className="ws-glow-wrapper w-full transition-transform duration-700 hover:scale-[1.01]"
            style={{ maxWidth: "860px" }}
          >
            <div
              className="ws-glass-panel w-full flex flex-col overflow-hidden"
              style={{ borderRadius: "1rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.05)" }}
            >

              {/* ── Mockup Tab Header ── */}
              <header
                className="w-full border-b relative"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  borderColor: "#e2e2e4",
                  padding: "24px 40px 0",
                }}
              >
                <div
                  ref={navContainerRef}
                  className="ws-no-scrollbar flex overflow-x-auto relative"
                  style={{ gap: "32px", paddingBottom: "10px" }}
                  id="tab-nav-container"
                >
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      ref={(el) => { tabRefs.current[tab.id] = el; }}
                      onClick={() => setActiveTab(tab.id)}
                      className="whitespace-nowrap cursor-pointer transition-colors duration-300"
                      style={{
                        ...F.labelMd,
                        textTransform: "uppercase",
                        paddingBottom: "8px",
                        color: activeTab === tab.id ? "#000000" : "#5e5e5e",
                        fontWeight: activeTab === tab.id ? 600 : 500,
                        background: "none",
                        border: "none",
                      }}
                    >
                      {tab.title}
                    </button>
                  ))}

                  {/* Sliding indicator */}
                  <div
                    className="absolute bottom-0 h-[2px] bg-primary transition-all duration-[400ms]"
                    style={{
                      transform: `translateX(${indicatorStyle.left}px)`,
                      width: `${indicatorStyle.width}px`,
                      transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
                    }}
                  />
                </div>
              </header>

              {/* ── Mockup Content Canvas ── */}
              <div
                style={{
                  padding: "32px 40px",
                  backgroundColor: "#ffffff",
                  minHeight: "480px",
                }}
              >

                {/* TAB 1 — Summary */}
                {activeTab === "summary" && (
                  <div className="ws-tab-fade flex flex-col" style={{ gap: "32px" }}>
                    <div>
                      <h3 style={{ ...F.headlineMd, color: "#000", marginBottom: "8px" }}>Summary</h3>
                      <div style={{ height: "1px", width: "48px", backgroundColor: "#000" }} />
                    </div>

                    <div style={{ maxWidth: "768px" }}>
                      <p style={{ fontFamily: "var(--font-sans), Inter, sans-serif", fontSize: "24px", lineHeight: "36px", color: "#1a1c1d", fontWeight: 400 }}>
                        Your landlord is requesting eviction. The notice period appears inconsistent with the terms outlined in the agreement.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "24px" }}>

                      {/* Risk Level */}
                      <div
                        className="relative overflow-hidden group flex flex-col justify-between"
                        style={{ background: "#f9f9fb", padding: "24px", borderRadius: "1rem", border: "1px solid #e2e2e4" }}
                      >
                        <div className="absolute" style={{ top: "-40px", right: "-40px", width: "128px", height: "128px", background: "rgba(186,26,26,0.1)", borderRadius: "9999px", filter: "blur(40px)" }} />
                        <span className="relative z-10" style={{ ...F.labelSm, color: "#5e5e5e", textTransform: "uppercase", display: "block", marginBottom: "16px" }}>Risk Level</span>
                        <div className="flex items-center relative z-10" style={{ gap: "12px" }}>
                          <AlertTriangle size={20} style={{ color: "#ba1a1a", flexShrink: 0 }} fill="#ba1a1a" />
                          <span style={{ ...F.headlineMd, color: "#000" }}>High</span>
                        </div>
                      </div>

                      {/* Case Type */}
                      <div
                        className="flex flex-col justify-between"
                        style={{ background: "#f9f9fb", padding: "24px", borderRadius: "1rem", border: "1px solid #e2e2e4" }}
                      >
                        <span style={{ ...F.labelSm, color: "#5e5e5e", textTransform: "uppercase", display: "block", marginBottom: "16px" }}>Case Type</span>
                        <div className="flex items-center" style={{ gap: "12px" }}>
                          <Home size={18} style={{ color: "#000", flexShrink: 0 }} />
                          <span style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", fontSize: "20px", lineHeight: "28px", color: "#000", fontWeight: 400 }}>Property Dispute</span>
                        </div>
                      </div>

                      {/* Important Dates */}
                      <div
                        className="flex flex-col justify-between"
                        style={{ background: "#f9f9fb", padding: "24px", borderRadius: "1rem", border: "1px solid #e2e2e4" }}
                      >
                        <span style={{ ...F.labelSm, color: "#5e5e5e", textTransform: "uppercase", display: "block", marginBottom: "16px" }}>Important Dates</span>
                        <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <li className="flex justify-between items-center" style={{ borderBottom: "1px solid #e2e2e4", paddingBottom: "8px" }}>
                            <span style={{ ...F.bodyMd, color: "#5e5e5e" }}>Hearing</span>
                            <span style={{ ...F.bodyMd, color: "#000", fontWeight: 500 }}>Oct 12</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span style={{ ...F.bodyMd, color: "#5e5e5e" }}>Deadline</span>
                            <span style={{ ...F.bodyMd, color: "#ba1a1a", fontWeight: 500 }}>Oct 05</span>
                          </li>
                        </ul>
                      </div>

                      {/* Recommended Action */}
                      <button
                        onClick={() => setActiveTab("drafts")}
                        className="flex flex-col justify-between group transition-colors duration-300 text-left"
                        style={{ background: "#f9f9fb", padding: "24px", borderRadius: "1rem", border: "1px solid #e2e2e4", cursor: "pointer", overflow: "hidden" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f3f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9f9fb")}
                      >
                        <span style={{ ...F.labelSm, color: "#5e5e5e", textTransform: "uppercase", display: "block", marginBottom: "16px" }}>Recommended Action</span>
                        <div className="flex items-center justify-between" style={{ gap: "8px", minWidth: 0 }}>
                          <span style={{ ...F.bodyLg, color: "#000", fontWeight: 500, minWidth: 0, flex: 1 }}>Draft Response</span>
                          <ArrowRight size={18} style={{ color: "#000", flexShrink: 0 }} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>

                    </div>
                  </div>
                )}

                {/* TAB 2 — Resolution */}
                {activeTab === "resolution" && (
                  <div className="ws-tab-fade flex flex-col" style={{ gap: "32px" }}>
                    <div>
                      <h3 style={{ ...F.headlineMd, color: "#000", marginBottom: "8px" }}>Resolution Path</h3>
                      <div style={{ height: "1px", width: "48px", backgroundColor: "#000" }} />
                    </div>
                    <div className="flex flex-col md:flex-row" style={{ gap: "48px" }}>
                      {/* Timeline */}
                      <div className="flex-1">
                        <div className="relative" style={{ borderLeft: "1px solid #e2e2e4", marginLeft: "12px" }}>
                          {[
                            { date: "Today", desc: "Case Opened", active: true },
                            { date: "Pending", desc: "Collect Evidence", active: false },
                            { date: "Upcoming", desc: "Submit Response", active: false },
                            { date: "Next Phase", desc: "Await Review", active: false },
                            { date: "Final", desc: "Further Action", active: false },
                          ].map((step, i) => (
                            <div key={i} className="relative" style={{ paddingLeft: "32px", paddingBottom: i < 4 ? "32px" : 0 }}>
                              <div
                                className="absolute"
                                style={{
                                  left: "-5px",
                                  top: "4px",
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "9999px",
                                  backgroundColor: step.active ? "#000" : "#e2e2e4",
                                  boxShadow: "0 0 0 4px #fff",
                                }}
                              />
                              <h4 style={{ ...F.labelMd, color: "#5e5e5e", textTransform: "uppercase", marginBottom: "4px" }}>{step.date}</h4>
                              <p style={{ ...F.bodyLg, color: "#000" }}>{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Alt options */}
                      <div className="flex-1 flex flex-col" style={{ gap: "16px" }}>
                        <span style={{ ...F.labelSm, color: "#5e5e5e", textTransform: "uppercase" }}>Alternative Options</span>
                        {["Negotiate Settlement", "Request Extension"].map((opt) => (
                          <button
                            key={opt}
                            className="flex justify-between items-center group transition-colors duration-300 text-left"
                            style={{ padding: "16px", border: "1px solid #e2e2e4", borderRadius: "1rem", cursor: "pointer", background: "none" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9fb")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                          >
                            <span style={{ ...F.bodyMd, color: "#000" }}>{opt}</span>
                            <ArrowRight size={16} style={{ color: "#5e5e5e", flexShrink: 0 }} className="group-hover:text-primary transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3 — Legal Insights */}
                {activeTab === "insights" && (
                  <div className="ws-tab-fade flex flex-col" style={{ gap: "32px" }}>
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 style={{ ...F.headlineMd, color: "#000", marginBottom: "8px" }}>Legal Insights</h3>
                        <div style={{ height: "1px", width: "48px", backgroundColor: "#000" }} />
                      </div>
                      <div className="text-right">
                        <span style={{ ...F.labelSm, color: "#5e5e5e", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Case Strength</span>
                        <span style={{ ...F.headlineLg, color: "#000" }}>72%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "24px" }}>
                      {[
                        {
                          icon: "lightbulb",
                          label: "Opportunity Detected",
                          body: "The landlord's notice was served 14 days prior, whereas the contract stipulates a 30-day minimum notice period.",
                          err: false,
                        },
                        {
                          icon: "gavel",
                          label: "Procedural Concern",
                          body: "Ensure all communications are formally documented; previous informal texts may not hold up as legal notice.",
                          err: false,
                        },
                        {
                          icon: "description",
                          label: "Documentation Review",
                          body: "Missing recent rent receipts from your records. Obtaining these will strengthen your position against eviction claims.",
                          err: false,
                        },
                        {
                          icon: "warning",
                          label: "Risk Alert",
                          body: "Failure to respond by Oct 05 will result in an automatic default judgment in favor of the landlord.",
                          err: true,
                        },
                      ].map((card) => {
                        const IconMap = {
                          lightbulb: Lightbulb,
                          gavel: Scale,
                          description: FileText,
                          warning: AlertTriangle,
                        } as const;
                        const Icon = IconMap[card.icon as keyof typeof IconMap];
                        return (
                          <div
                            key={card.label}
                            className="flex flex-col"
                            style={{
                              padding: "24px",
                              borderRadius: "1rem",
                              border: card.err ? "1px solid rgba(186,26,26,0.2)" : "1px solid #e2e2e4",
                              background: card.err ? "rgba(186,26,26,0.05)" : "#f9f9fb",
                              gap: "12px",
                            }}
                          >
                            <div className="flex items-center" style={{ gap: "8px" }}>
                              <Icon size={16} style={{ color: card.err ? "#ba1a1a" : "#000", flexShrink: 0 }} />
                              <span style={{ ...F.labelMd, color: card.err ? "#ba1a1a" : "#000", textTransform: "uppercase" }}>{card.label}</span>
                            </div>
                            <p style={{ ...F.bodyMd, color: "#5e5e5e" }}>{card.body}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 4 — Drafts */}
                {activeTab === "drafts" && (
                  <div className="ws-tab-fade flex flex-col" style={{ gap: "32px" }}>
                    <div className="flex flex-wrap justify-between items-end" style={{ gap: "16px" }}>
                      <div>
                        <h3 style={{ ...F.headlineMd, color: "#000", marginBottom: "8px" }}>Drafts</h3>
                        <div style={{ height: "1px", width: "48px", backgroundColor: "#000" }} />
                      </div>
                      <div className="flex" style={{ gap: "12px" }}>
                        <button
                          style={{ padding: "8px 16px", border: "1px solid #e2e2e4", borderRadius: "9999px", ...F.labelMd, color: "#000", textTransform: "uppercase", background: "none", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9fb")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          Complaint
                        </button>
                        <button
                          onClick={() => {
                            setDraftText("Generating draft reply...");
                            setTimeout(() => {
                              setDraftText(`[Date: October 1, 2026]\n\nTo: [Landlord Name]\nRe: Notice of Eviction Dispute — Settlement Proposal\n\nDear [Landlord Name],\n\nWe have formally reviewed the Notice of Eviction dated September 20. As previously noted, the 14-day timeline served violates Section 8 (Minimum Notice Duration) of the lease.\n\nIn the interest of reaching an amicable settlement without legal escalation, I propose a lease restructuring or an extension of the vacancy timeline to 60 days, giving both parties sufficient time to transition.\n\nPlease let us know your availability for a conference call this coming Thursday.\n\nSincerely,\n[Your Name]`);
                            }, 1200);
                          }}
                          style={{ padding: "8px 16px", borderRadius: "9999px", ...F.labelMd, color: "#fff", textTransform: "uppercase", background: "#000", border: "none", cursor: "pointer" }}
                        >
                          Generate Reply
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col" style={{ border: "1px solid #e2e2e4", borderRadius: "1rem", background: "#f9f9fb", height: "400px" }}>
                      <div className="flex justify-between items-center" style={{ borderBottom: "1px solid #e2e2e4", padding: "16px 24px", background: "rgba(255,255,255,0.5)", borderRadius: "1rem 1rem 0 0" }}>
                        <span style={{ ...F.labelMd, color: "#000", textTransform: "uppercase" }}>Response To Eviction Notice</span>
                        <MoreHorizontal size={18} style={{ color: "#5e5e5e", cursor: "pointer" }} />
                      </div>
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        className="flex-1 outline-none resize-none"
                        style={{ padding: "32px", ...F.bodyMd, color: "#5e5e5e", background: "transparent", border: "none", lineHeight: "24px" }}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 5 — Ask Nyaya */}
                {activeTab === "ask" && (
                  <div className="ws-tab-fade flex flex-col w-full" style={{ gap: "32px" }}>
                    <div>
                      <h3 style={{ ...F.headlineMd, color: "#000", marginBottom: "8px" }}>Ask Nyaya</h3>
                      <div style={{ height: "1px", width: "48px", backgroundColor: "#000" }} />
                    </div>

                    <div className="flex flex-col" style={{ border: "1px solid #e2e2e4", borderRadius: "1rem", background: "#f9f9fb", height: "400px" }}>
                      {/* Messages */}
                      <div className="flex-1 flex flex-col overflow-y-auto" style={{ padding: "24px", gap: "24px" }}>
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                              maxWidth: "80%",
                              padding: "16px",
                              borderRadius: msg.sender === "user" ? "1rem 0 1rem 1rem" : "0 1rem 1rem 1rem",
                              background: msg.sender === "user" ? "#eeeef0" : "#fff",
                              border: msg.sender === "ai" ? "1px solid #e2e2e4" : "none",
                            }}
                          >
                            <p style={{ ...F.bodyMd, color: msg.sender === "user" ? "#000" : "#5e5e5e" }}>{msg.text}</p>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="flex items-center self-start" style={{ gap: "4px", background: "#fff", border: "1px solid #e2e2e4", padding: "16px", borderRadius: "0 1rem 1rem 1rem" }}>
                            {[0, 0.2, 0.4].map((d) => (
                              <div key={d} className="animate-bounce" style={{ width: "6px", height: "6px", borderRadius: "9999px", backgroundColor: "#cfc4c5", animationDelay: `${d}s` }} />
                            ))}
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Input */}
                      <form onSubmit={handleChatSubmit} className="flex items-center" style={{ borderTop: "1px solid #e2e2e4", padding: "16px", background: "rgba(255,255,255,0.5)", borderRadius: "0 0 1rem 1rem", gap: "12px" }}>
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask a question about your case..."
                          className="flex-1 outline-none border-none focus:ring-0"
                          style={{ ...F.bodyMd, background: "#f9f9fb", borderRadius: "9999px", padding: "8px 20px", color: "#000" }}
                        />
                        <button
                          type="submit"
                          className="flex items-center justify-center transition-colors"
                          style={{ width: "40px", height: "40px", borderRadius: "9999px", background: "#000", border: "none", cursor: "pointer", flexShrink: 0 }}
                        >
                          <Send size={16} style={{ color: "#fff" }} />
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* TAB 6 — History */}
                {activeTab === "history" && (
                  <div className="ws-tab-fade flex flex-col" style={{ gap: "32px" }}>
                    <div>
                      <h3 style={{ ...F.headlineMd, color: "#000", marginBottom: "8px" }}>Case History</h3>
                      <div style={{ height: "1px", width: "48px", backgroundColor: "#000" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {[
                        { title: "Property Dispute", date: "Opened: Sep 15, 2024", badge: "High Risk", badgeBg: "rgba(186,26,26,0.1)", badgeColor: "#ba1a1a", icon: "home", faded: false },
                        { title: "Employment Termination", date: "Closed: Mar 10, 2024", badge: "Resolved", badgeBg: "#e2e2e4", badgeColor: "#5e5e5e", icon: "work", faded: true },
                        { title: "Consumer Complaint", date: "Closed: Nov 02, 2023", badge: "Resolved", badgeBg: "#e2e2e4", badgeColor: "#5e5e5e", icon: "shopping_cart", faded: true },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex justify-between items-center group transition-colors duration-300"
                          style={{
                            padding: "16px",
                            border: "1px solid #e2e2e4",
                            borderRadius: "1rem",
                            background: item.faded ? "#fff" : "#f9f9fb",
                            opacity: item.faded ? 0.7 : 1,
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f3f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.faded ? "#fff" : "#f9f9fb")}
                        >
                          <div className="flex items-center" style={{ gap: "16px" }}>
                            <div className="flex items-center justify-center" style={{ width: "40px", height: "40px", borderRadius: "9999px", background: item.faded ? "#eeeef0" : "#fff", border: "1px solid #e2e2e4", flexShrink: 0 }}>
                              {item.icon === "home" && <Home size={16} style={{ color: item.faded ? "#5e5e5e" : "#000" }} />}
                              {item.icon === "work" && <Briefcase size={16} style={{ color: item.faded ? "#5e5e5e" : "#000" }} />}
                              {item.icon === "shopping_cart" && <ShoppingCart size={16} style={{ color: item.faded ? "#5e5e5e" : "#000" }} />}
                            </div>
                            <div>
                              <h4 style={{ ...F.bodyMd, color: item.faded ? "#5e5e5e" : "#000", fontWeight: 500 }}>{item.title}</h4>
                              <span style={{ ...F.labelSm, color: "#5e5e5e", textTransform: "uppercase" }}>{item.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center" style={{ gap: "16px" }}>
                            <span style={{ ...F.labelSm, textTransform: "uppercase", background: item.badgeBg, color: item.badgeColor, padding: "4px 8px", borderRadius: "4px", whiteSpace: "nowrap" }}>{item.badge}</span>
                            <ChevronRight size={16} style={{ color: "#5e5e5e", flexShrink: 0 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* ── Closing Statement ── */}
          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <p style={{ fontFamily: "var(--font-serif), 'Instrument Serif', serif", fontSize: "32px", lineHeight: "40px", color: "#5e5e5e", letterSpacing: "-0.01em", fontWeight: 400 }}>
              One case. One conversation.{" "}
              <span style={{ color: "#000" }}>Complete clarity.</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
