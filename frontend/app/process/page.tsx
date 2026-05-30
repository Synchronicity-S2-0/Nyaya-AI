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

/* Each step is its own component so useInView is called at the top level — no hook-in-loop violation */
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
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className="flex flex-row md:flex-col gap-6 md:gap-0"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: 0.2 + index * 0.2, // 0.2 / 0.4 / 0.6 / 0.8 s
      }}
    >
      {/* Step number — label-md, sits on the timeline line on desktop */}
      <div className="flex-shrink-0 w-12 md:w-auto md:mb-8">
        <span
          className="text-secondary block md:inline-block md:pr-4"
          style={{
            fontFamily: "var(--font-sans), Inter, sans-serif",
            fontSize: "12px",
            lineHeight: "16px",
            letterSpacing: "0.1em",
            fontWeight: 500,
            /* white bg so the number sits "on top of" the hr line on desktop */
            backgroundColor: "var(--color-background, #f9f9fb)",
          }}
        >
          {num}
        </span>
      </div>

      {/* Title + body */}
      <div>
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
      </div>
    </motion.div>
  );
}

export default function ProcessPage() {
  /* Timeline horizontal line */
  const lineRef = useRef(null);
  const lineInView = useInView(lineRef, { once: true, amount: 0.2 });

  return (
    <section
      id="process"
      className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden"
    >
      {/* ── Header row ── */}
      <div className="mb-24 md:mb-32 grid grid-cols-1 md:grid-cols-2 gap-gutter items-end">

        {/* Left: Instrument Serif display headline */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
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

        {/* Right: Inter body-lg description, right-aligned */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: 0.15 }}
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
      <div className="relative w-full">

        {/* Horizontal timeline line — desktop only, animates with motion scaleX */}
        <div
          ref={lineRef}
          className="hidden md:block absolute left-0 w-full overflow-hidden"
          style={{ top: "24px", height: "1px" }}
        >
          <motion.div
            className="h-full w-full origin-left"
            style={{ backgroundColor: "#cfc4c5" /* outline-variant */ }}
            initial={{ scaleX: 0 }}
            animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>

        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
          {steps.map((step, i) => (
            <StepCard key={step.num} {...step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
