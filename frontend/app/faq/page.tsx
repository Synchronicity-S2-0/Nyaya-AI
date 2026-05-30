"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

const faqs = [
  {
    q: "Is Nyaya AI legal advice?",
    a: "No. Nyaya AI provides highly sophisticated legal research, document summarization, and predictive analysis based on vast datasets of jurisprudence. It is designed as a powerful augmentation tool for qualified legal professionals, not a replacement for certified legal counsel.",
  },
  {
    q: "Does it replace lawyers?",
    a: "Nyaya AI acts as an accelerator, automating tedious research and document structuring tasks. It amplifies the capabilities of modern lawyers, allowing them to focus on high-level strategy, client relations, and complex negotiations rather than manual discovery.",
  },
  {
    q: "What documents can I upload?",
    a: "The platform accepts a wide array of formats including PDF, DOCX, TXT, and scanned image files (processed via our proprietary OCR). You can securely upload contracts, court transcripts, briefs, and internal memos for instant contextual analysis.",
  },
  {
    q: "Is my data secure?",
    a: "Security is our foundational architecture. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We operate within SOC 2 Type II compliant isolated environments. Your uploaded documents are never used to train base public models without explicit organizational opt-in.",
  },
  {
    q: "Can I use regional languages?",
    a: "Yes. Nyaya AI natively supports over 40 global languages and numerous regional dialects relevant to international law. It seamlessly translates, analyzes, and cross-references multi-lingual jurisprudence within a single unified workspace.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section
      id="faq"
      className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap flex flex-col md:flex-row gap-gutter md:gap-32"
    >
      {/* ── Left column: sticky title ── */}
      <div className="w-full md:w-1/3 md:sticky md:top-32 h-fit mb-12 md:mb-0">
        <h2
          className="text-primary leading-tight"
          style={{
            fontFamily: "var(--font-serif), 'Instrument Serif', serif",
            fontSize: "clamp(48px, 5vw, 80px)",
            lineHeight: "clamp(52px, 5.5vw, 88px)",
            fontWeight: 400,
          }}
        >
          Frequently Asked Questions
        </h2>
        <p
          className="text-secondary mt-6 max-w-sm"
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: "16px",
            lineHeight: "24px",
            fontWeight: 400,
          }}
        >
          Clarity on our premium jurisprudence models and how they integrate
          into your practice.
        </p>
      </div>

      {/* ── Right column: accordion ── */}
      <div
        className="w-full md:w-2/3 border-t"
        style={{ borderColor: "#e2e2e4" /* surface-container-highest */ }}
      >
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="border-b group cursor-pointer"
              style={{ borderColor: "#e2e2e4" }}
              onClick={() => toggle(i)}
            >
              {/* ── Question row ── */}
              <div className="flex justify-between items-center py-8">
                <h3
                  className="transition-colors duration-300 font-medium"
                  style={{
                    fontFamily: "var(--font-sans), Inter, sans-serif",
                    fontSize: "clamp(16px, 1.4vw, 20px)",
                    lineHeight: "28px",
                    fontWeight: 500,
                    color: isOpen ? "#5e5e5e" : "#000",
                  }}
                >
                  {item.q}
                </h3>

                {/* + / × toggle icon */}
                <span
                  className="transition-transform duration-300 flex-shrink-0 ml-4"
                  style={{ color: "#5e5e5e" }}
                >
                  {isOpen ? <X size={22} strokeWidth={1.25} /> : <Plus size={22} strokeWidth={1.25} />}
                </span>
              </div>

              {/* ── Answer panel — animated height ── */}
              <div
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{ maxHeight: isOpen ? "400px" : "0px" }}
              >
                <div
                  className="pb-8 leading-relaxed md:w-5/6"
                  style={{
                    fontFamily: "var(--font-sans), Inter, sans-serif",
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: 400,
                    color: "#5e5e5e",
                  }}
                >
                  {item.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
