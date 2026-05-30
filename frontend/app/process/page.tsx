"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Upload a Document",
    body: "Upload notices, contracts, FIRs, agreements or legal communications.",
  },
  {
    num: "02",
    title: "Describe Your Situation",
    body: "Explain your problem in plain language.",
  },
  {
    num: "03",
    title: "Understand Your Position",
    body: "Receive risks, protections and procedural guidance.",
  },
  {
    num: "04",
    title: "Take Action",
    body: "Generate responses and next-step documents.",
  },
];

/* ── Individual step card — bidirectional reveal ── */
function StepCard({
  num,
  title,
  body,
  index,
}: {
  num: string;
  title: string;
  body: string;
  index: number;
}) {
  const ref = useRef(null);
  /* once: false → animates back out when scrolling up */
  const isInView = useInView(ref, {
    once: false,
    margin: "0px 0px -120px 0px", // trigger a bit before the card fully enters
  });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-0"
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 60, scale: 0.92 }
      }
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.12, // cascade: 0 / 0.12 / 0.24 / 0.36 s
      }}
    >
      {/* Timeline dot + number */}
      <div className="mb-8 flex items-center gap-3">
        {/* Dot */}
        <motion.div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: "#1a1c1d" }}
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{
            duration: 0.4,
            ease: "backOut",
            delay: index * 0.12 + 0.2,
          }}
        />
        {/* Step number */}
        <span
          className="text-secondary"
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: "12px",
            lineHeight: "16px",
            letterSpacing: "0.12em",
            fontWeight: 600,
          }}
        >
          {num}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-primary mb-4"
        style={{
          fontFamily: "var(--font-serif), 'Instrument Serif', serif",
          fontSize: "32px",
          lineHeight: "40px",
          fontWeight: 400,
        }}
      >
        {title}
      </h3>

      {/* Body */}
      <p
        className="text-secondary"
        style={{
          fontFamily: "var(--font-sans), Inter, sans-serif",
          fontSize: "16px",
          lineHeight: "24px",
          fontWeight: 400,
        }}
      >
        {body}
      </p>
    </motion.div>
  );
}

export default function ProcessPage() {
  /* Section-level ref for the timeline line */
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, {
    once: false,
    margin: "0px 0px -80px 0px",
  });

  return (
    <section
      id="process"
      className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden"
    >
      {/* ── Header row ── */}
      <div className="mb-24 md:mb-32 grid grid-cols-1 md:grid-cols-2 gap-gutter items-end">

        {/* Left: Instrument Serif display headline */}
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-primary max-w-xl"
          style={{
            fontFamily: "var(--font-serif), 'Instrument Serif', serif",
            fontSize: "clamp(48px, 6vw, 80px)",
            lineHeight: "clamp(52px, 6.6vw, 88px)",
            letterSpacing: "-0.02em",
            fontWeight: 300,
          }}
        >
          From uncertainty to
          <br />
          <i style={{ color: "#5e5e5e" }}>action.</i>
        </motion.h2>

        {/* Right: description */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <p
            className="text-secondary max-w-md"
            style={{
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: "18px",
              lineHeight: "28px",
              letterSpacing: "0.01em",
              fontWeight: 400,
            }}
          >
            We&apos;ve distilled the complexity of legal systems into a clear,
            four-step journey. Nyaya AI provides the clarity needed to navigate
            notices, contracts, and procedural hurdles with confidence and
            precision.
          </p>
        </motion.div>
      </div>

      {/* ── Steps ── */}
      <div ref={lineRef} className="relative w-full">

        {/* Horizontal timeline line — desktop only */}
        <div
          className="hidden md:block absolute left-0 w-full overflow-hidden pointer-events-none"
          style={{ top: "5px", height: "1px" }}
        >
          <motion.div
            className="h-full w-full origin-left"
            style={{ backgroundColor: "#cfc4c5" }}
            initial={{ scaleX: 0 }}
            animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 relative z-10">
          {steps.map((step, i) => (
            <StepCard key={step.num} {...step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
