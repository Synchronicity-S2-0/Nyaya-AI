const cards = [
  {
    alt: "Procedural Concern",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3RQJ_8MveqEA6-yXmOCZwH2Su8fUwoA_XRnuvb-jswi3apo08wQCm-ikHm3v37_OMKHNnfUOLCgkXIjW6NMcwIIop5myJwN5LcQI16Vcj-votgSo-t9_5QI_Pj9W-kIhWLMv_OPA5Km7rgvnxX_C8lwbUOcuLr9AaKfNDlnYbJON8Tr1Nzty_dk4O14sx2rAGaT4_5LBjIKzNn5XtXR3l7KeeYExKF9GEyv8uOwSqHD4tInhpFAnPc8yTtsPFwOj8zT2Lj9VO4yw",
    title: "Procedural Concern",
    body: "Some details may not align with the surrounding information and should be verified.",
  },
  {
    alt: "Documentation Gap",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHx29lHSzhYtrvD-42KinHcFei32hj9VToDXPq5mGTO62qwERe21G3GmD_wm730m5j_SxNBVbFuGCfLquC1XgFU9ovYjdIUyijREnMAi0mIduhyZ-3XAoH7vEBAuCs2j33zSe_8uI6E6ac6465414-UQoCNli7PxV-pO728bJH5APNjGiYHG_RCr1Qi-laXrZyXRn5IX9ZbdBesw6eT2sIyNMVIISVsr-wPJ23elPzUAyHnBcJsJLBgCXFUs7b62FJ2YmtkmgAtDk",
    title: "Documentation Gap",
    body: "Relevant supporting information could not be identified in the submitted materials.",
  },
  {
    alt: "Case Position",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuupmBhcyGJiq1lvQWmpKUYbMXSyXxNrTNRBaLTUqz6qVrOCpYC5_jy7v0sCxNzR_ObSUxABXz586Bit7Af-y8cP8K4TLvUhmB7FrjSY65W-L33jymt01k1B3dvYrS7RshoylYdKXXJpQt6uKPSxH-XNg4MCCfW-bN-VJasT1S9TwBVWgbO-MFbuwt8QCqbewYF2WBH2VJQ4Kk0M09_BkNwXFSwApznwMYQOir_eY4A4VH0IFkaGjM3LaXkwOyNgjfSi0E9nTc4Yo",
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
        <div className="mb-16 text-center">
          <span
            className="text-secondary uppercase"
            style={{
              fontFamily: "var(--font-sans), Inter, sans-serif",
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "0.2em",
              fontWeight: 500,
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
              className="group flex flex-col border rounded-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-500"
              style={{ borderColor: "rgba(207, 196, 197, 0.3)" /* outline-variant/30 */ }}
            >
              {/* Image — 400px mobile / 500px desktop, zoom on hover */}
              <div className="h-[400px] md:h-[500px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
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
