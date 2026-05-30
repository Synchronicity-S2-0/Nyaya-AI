"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const faqs: FAQItem[] = [
    {
      question: "Is Nyaya AI a replacement for a legal attorney?",
      answer: "No, Nyaya AI acts as an editorial legal assistant providing structural review, highlighting procedural gaps, and drafting initial responses. It helps you prepare thoroughly but is not a substitute for formal, local legal counsel.",
    },
    {
      question: "How does the notice period inconsistency detection work?",
      answer: "When you upload an eviction notice and lease, Nyaya extracts the dates and notice requirement parameters from the agreement, compares them against the date stamp on the formal notification, and flags cases where the statutory window is violated.",
    },
    {
      question: "Are my submitted documents kept private and secure?",
      answer: "Absolutely. All documents are stored securely using industry-standard encryption standards. Data is used exclusively to facilitate your workspace case analysis and is never shared with third parties or used for training open public models.",
    },
    {
      question: "Can I customize the generated drafts?",
      answer: "Yes, every counter-notice, extension request, or complaint generated in your Workspace tab features an interactive document editor. You can edit the text directly before exporting or printing.",
    },
    {
      question: "What legal domains does Nyaya AI support?",
      answer: "Currently, our models are highly optimized for Property & Tenancy Disputes, Consumer Complaints, and Employment Contract Reviews.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-[#f9f9fb] dark:bg-neutral-950 pt-[140px] pb-32 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Header */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-20 text-center animate-fade-rise">
        <span className="font-sans text-label-md uppercase tracking-[0.25em] text-secondary dark:text-neutral-400 font-semibold block mb-4">
          Support
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-primary dark:text-white mb-6 italic tracking-tight">
          Frequently asked questions.
        </h1>
        <p className="font-sans text-body-lg text-secondary dark:text-neutral-400 max-w-2xl mx-auto">
          Get answers regarding document security, notice timeline assessments, and the scope of Nyaya AI's capabilities.
        </p>
      </div>

      {/* FAQ Accordion container */}
      <section className="max-w-3xl mx-auto px-margin-mobile">
        <div className="space-y-4">
          
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-neutral-200/60 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 transition-all duration-300"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left cursor-pointer focus:outline-none"
                >
                  <span className="font-sans text-lg font-medium text-primary dark:text-white leading-snug">
                    {faq.question}
                  </span>
                  <span
                    className={`material-symbols-outlined text-secondary dark:text-neutral-400 select-none transform transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    keyboard_arrow_down
                  </span>
                </button>
                
                {/* Accordion panel */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-[200px] border-t border-neutral-100 dark:border-neutral-850" : "max-h-0"
                  }`}
                >
                  <p className="px-6 py-5 font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed bg-neutral-50/50 dark:bg-neutral-950/20">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </section>

    </main>
  );
}
