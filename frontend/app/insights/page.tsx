import { images } from "@/constants/image";
import Image from "next/image";


const cards = [
  {
    alt: "Procedural Concern",
    src: images.insight1,
    title: "Procedural Concern",
    body: "Some details may not align with the surrounding information and should be verified.",
  },
  {
    alt: "Documentation Gap",
    src: images.insight2,
    title: "Documentation Gap",
    body: "Relevant supporting information could not be identified in the submitted materials.",
  },
  {
    alt: "Case Position",
    src: images.insight3,
    title: "Case Position",
    body: "The content appears well aligned with the available supporting information.",
  },
];

export default function InsightsPage() {
  return (
    <section
      id="legal-insights"
      className="w-full py-section-gap bg-surface-container-lowest relative z-30"
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">

        {/* ── Section label ── */}
        <div className="mb-16 flex justify-center">
          <span
            className="text-secondary uppercase inline-flex items-center"
            style={{
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "0.2em",
              fontWeight: 500,
              border: "1px solid rgba(207, 196, 197, 0.6)",
              borderRadius: "999px",
              padding: "10px 24px",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
            }}
          >
            Legal Insights
          </span>
        </div>


        {/* ── 3-column card grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group flex flex-col border rounded-[32px] overflow-hidden bg-white hover:shadow-xl transition-shadow duration-500"
              style={{ borderColor: "rgba(207, 196, 197, 0.3)" /* outline-variant/30 */ }}
            >
              {/* Image — 400px mobile / 500px desktop, zoom on hover */}
              <div className="h-[400px] md:h-[500px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image
                  alt={card.alt}
                  src={card.src}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Card body */}
              <div className="p-8 flex flex-col flex-grow">
                {/* Empty tag slot — kept to match HTML structure */}
                <div className="mb-4" />

                {/* Instrument Serif headline-md */}
                <h3
                  className="text-primary mb-4"
                  style={{
                    fontFamily: "var(--font-serif), 'Instrument Serif', serif",
                    fontSize: "32px",
                    lineHeight: "40px",
                    fontWeight: 400,
                  }}
                >
                  {card.title}
                </h3>

                {/* Inter body-md description */}
                <p
                  className="text-secondary leading-relaxed"
                  style={{
                    fontFamily: "var(--font-sans), Inter, sans-serif",
                    fontSize: "16px",
                    lineHeight: "24px",
                    fontWeight: 400,
                  }}
                >
                  {card.body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
