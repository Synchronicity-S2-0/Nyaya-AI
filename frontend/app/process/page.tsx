export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-[#f9f9fb] dark:bg-neutral-950 pt-[140px] pb-32 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Header */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24 text-center animate-fade-rise">
        <span className="font-sans text-label-md uppercase tracking-[0.25em] text-secondary dark:text-neutral-400 font-semibold block mb-4">
          Our Process
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-primary dark:text-white mb-6 italic tracking-tight">
          How Nyaya AI resolves uncertainty.
        </h1>
        <p className="font-sans text-body-lg text-secondary dark:text-neutral-400 max-w-2xl mx-auto">
          A seamless transition from complex documents to definitive legal actions in four simplified procedural phases.
        </p>
      </div>

      {/* Process Timeline */}
      <section className="max-w-4xl mx-auto px-margin-mobile">
        <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-4 md:ml-8 space-y-16">
          
          {/* Step 1 */}
          <div className="relative pl-10 md:pl-16 group">
            <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary dark:border-white flex items-center justify-center font-serif text-primary dark:text-white font-semibold transition-transform duration-300 group-hover:scale-105 shadow-md">
              1
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-primary dark:text-white mb-3">
              Ingest & Analyze
            </h3>
            <p className="font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed max-w-xl">
              Upload your agreement, notice, or correspondence. Our engine immediately parses structure, syntax, and relevant statutes.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative pl-10 md:pl-16 group">
            <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary dark:border-white flex items-center justify-center font-serif text-primary dark:text-white font-semibold transition-transform duration-300 group-hover:scale-105 shadow-md">
              2
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-primary dark:text-white mb-3">
              Detect Risks & Gaps
            </h3>
            <p className="font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed max-w-xl">
              Nyaya highlights procedural anomalies, missing verification details, or notice period inconsistencies within seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative pl-10 md:pl-16 group">
            <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary dark:border-white flex items-center justify-center font-serif text-primary dark:text-white font-semibold transition-transform duration-300 group-hover:scale-105 shadow-md">
              3
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-primary dark:text-white mb-3">
              Draft & Synthesize
            </h3>
            <p className="font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed max-w-xl">
              Access automatically populated response drafts, customize parameters, or generate tailored counter-proposals with a single click.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative pl-10 md:pl-16 group">
            <div className="absolute -left-5 top-0 w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border-2 border-primary dark:border-white flex items-center justify-center font-serif text-primary dark:text-white font-semibold transition-transform duration-300 group-hover:scale-105 shadow-md">
              4
            </div>
            <h3 className="font-serif text-2xl md:text-3xl text-primary dark:text-white mb-3">
              Resolve & Archive
            </h3>
            <p className="font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed max-w-xl">
              Track case milestones on a persistent timeline. Store history securely within your editorial legal dashboard.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}
