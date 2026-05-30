import Image from "next/image";

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-[#f9f9fb] dark:bg-neutral-950 pt-[140px] pb-32 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      
      {/* Editorial Header */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-20 text-center animate-fade-rise">
        <span className="font-sans text-label-md uppercase tracking-[0.25em] text-secondary dark:text-neutral-400 font-semibold block mb-4">
          Legal Insights
        </span>
        <h1 className="font-serif text-5xl md:text-7xl text-primary dark:text-white mb-6 italic tracking-tight">
          Beyond silence, we build the eternal.
        </h1>
        <p className="font-sans text-body-lg text-secondary dark:text-neutral-400 max-w-2xl mx-auto">
          Detailed analytical assessments and procedural checkpoints compiled by Nyaya AI editorial intelligence.
        </p>
      </div>

      {/* Grid Canvas */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1 */}
          <div className="group flex flex-col border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="h-[400px] md:h-[480px] overflow-hidden relative bg-neutral-100 dark:bg-neutral-800">
              <img
                alt="Procedural Concern"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3RQJ_8MveqEA6-yXmOCZwH2Su8fUwoA_XRnuvb-jswi3apo08wQCm-ikHm3v37_OMKHNnfUOLCgkXIjW6NMcwIIop5myJwN5LcQI16Vcj-votgSo-t9_5QI_Pj9W-kIhWLMv_OPA5Km7rgvnxX_C8lwbUOcuLr9AaKfNDlnYbJON8Tr1Nzty_dk4O14sx2rAGaT4_5LBjIKzNn5XtXR3l7KeeYExKF9GEyv8uOwSqHD4tInhpFAnPc8yTtsPFwOj8zT2Lj9VO4yw"
                loading="lazy"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="mb-4">
                <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-full font-semibold">
                  Review Recommended
                </span>
              </div>
              <h3 className="font-serif text-headline-md text-primary dark:text-white mb-4">
                Procedural Concern
              </h3>
              <p className="font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed">
                The notice period appears shorter than the duration specified within the agreement.
              </p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="group flex flex-col border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="h-[400px] md:h-[480px] overflow-hidden relative bg-neutral-100 dark:bg-neutral-800">
              <img
                alt="Documentation Gap"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHx29lHSzhYtrvD-42KinHcFei32hj9VToDXPq5mGTO62qwERe21G3GmD_wm730m5j_SxNBVbFuGCfLquC1XgFU9ovYjdIUyijREnMAi0mIduhyZ-3XAoH7vEBAuCs2j33zSe_8uI6E6ac6465414-UQoCNli7PxV-pO728bJH5APNjGiYHG_RCr1Qi-laXrZyXRn5IX9ZbdBesw6eT2sIyNMVIISVsr-wPJ23elPzUAyHnBcJsJLBgCXFUs7b62FJ2YmtkmgAtDk"
                loading="lazy"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="mb-4">
                <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-full font-semibold">
                  Opportunity Detected
                </span>
              </div>
              <h3 className="font-serif text-headline-md text-primary dark:text-white mb-4">
                Documentation Gap
              </h3>
              <p className="font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed">
                Supporting documentation referenced in the notice could not be identified within the submitted materials.
              </p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="group flex flex-col border border-neutral-200/60 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="h-[400px] md:h-[480px] overflow-hidden relative bg-neutral-100 dark:bg-neutral-800">
              <img
                alt="Case Position"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuupmBhcyGJiq1lvQWmpKUYbMXSyXxNrTNRBaLTUqz6qVrOCpYC5_jy7v0sCxNzR_ObSUxABXz586Bit7Af-y8cP8K4TLvUhmB7FrjSY65W-L33jymt01k1B3dvYrS7RshoylYdKXXJpQt6uKPSxH-XNg4MCCfW-bN-VJasT1S9TwBVWgbO-MFbuwt8QCqbewYF2WBH2VJQ4Kk0M09_BkNwXFSwApznwMYQOir_eY4A4VH0IFkaGjM3LaXkwOyNgjfSi0E9nTc4Yo"
                loading="lazy"
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="mb-4">
                <span className="font-sans text-label-sm text-secondary dark:text-neutral-400 uppercase border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-full font-semibold">
                  Moderately Strong
                </span>
              </div>
              <h3 className="font-serif text-headline-md text-primary dark:text-white mb-4">
                Case Position
              </h3>
              <p className="font-sans text-body-md text-secondary dark:text-neutral-400 leading-relaxed">
                Based on the available information, the user's position appears reasonably supported by the documented agreement terms.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Decorative Atmospheric blur */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-radial-gradient from-orange-100/10 dark:from-neutral-900/20 to-transparent blur-[160px] pointer-events-none -z-10" />
    </main>
  );
}
