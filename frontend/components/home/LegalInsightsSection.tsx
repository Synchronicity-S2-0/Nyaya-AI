export function LegalInsightsSection() {
  return (
    <section className="w-full py-section-gap bg-surface-container-lowest relative z-30" id="legal-insights">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-16 text-center">
          <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-secondary">Legal Insights</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          
          {/* Column 1 */}
          <div className="group flex flex-col border border-outline-variant/30 rounded-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-500">
            <div className="h-[400px] md:h-[500px] overflow-hidden">
              <img 
                alt="Procedural Concern" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3RQJ_8MveqEA6-yXmOCZwH2Su8fUwoA_XRnuvb-jswi3apo08wQCm-ikHm3v37_OMKHNnfUOLCgkXIjW6NMcwIIop5myJwN5LcQI16Vcj-votgSo-t9_5QI_Pj9W-kIhWLMv_OPA5Km7rgvnxX_C8lwbUOcuLr9AaKfNDlnYbJON8Tr1Nzty_dk4O14sx2rAGaT4_5LBjIKzNn5XtXR3l7KeeYExKF9GEyv8uOwSqHD4tInhpFAnPc8yTtsPFwOj8zT2Lj9VO4yw" 
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="mb-4">
                <span className="font-label-sm text-label-sm text-secondary uppercase border border-outline-variant px-2 py-1">Review Recommended</span>
              </div>
              <h3 className="font-instrument text-headline-md text-primary mb-4">Procedural Concern</h3>
              <p className="font-body-md text-secondary leading-relaxed">The notice period appears shorter than the duration specified within the agreement.</p>
            </div>
          </div>
          
          {/* Column 2 */}
          <div className="group flex flex-col border border-outline-variant/30 rounded-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-500">
            <div className="h-[400px] md:h-[500px] overflow-hidden">
              <img 
                alt="Documentation Gap" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHx29lHSzhYtrvD-42KinHcFei32hj9VToDXPq5mGTO62qwERe21G3GmD_wm730m5j_SxNBVbFuGCfLquC1XgFU9ovYjdIUyijREnMAi0mIduhyZ-3XAoH7vEBAuCs2j33zSe_8uI6E6ac6465414-UQoCNli7PxV-pO728bJH5APNjGiYHG_RCr1Qi-laXrZyXRn5IX9ZbdBesw6eT2sIyNMVIISVsr-wPJ23elPzUAyHnBcJsJLBgCXFUs7b62FJ2YmtkmgAtDk" 
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="mb-4">
                <span className="font-label-sm text-label-sm text-secondary uppercase border border-outline-variant px-2 py-1">Opportunity Detected</span>
              </div>
              <h3 className="font-instrument text-headline-md text-primary mb-4">Documentation Gap</h3>
              <p className="font-body-md text-secondary leading-relaxed">Supporting documentation referenced in the notice could not be identified within the submitted materials.</p>
            </div>
          </div>
          
          {/* Column 3 */}
          <div className="group flex flex-col border border-outline-variant/30 rounded-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-500">
            <div className="h-[400px] md:h-[500px] overflow-hidden">
              <img 
                alt="Case Position" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuupmBhcyGJiq1lvQWmpKUYbMXSyXxNrTNRBaLTUqz6qVrOCpYC5_jy7v0sCxNzR_ObSUxABXz586Bit7Af-y8cP8K4TLvUhmB7FrjSY65W-L33jymt01k1B3dvYrS7RshoylYdKXXJpQt6uKPSxH-XNg4MCCfW-bN-VJasT1S9TwBVWgbO-MFbuwt8QCqbewYF2WBH2VJQ4Kk0M09_BkNwXFSwApznwMYQOir_eY4A4VH0IFkaGjM3LaXkwOyNgjfSi0E9nTc4Yo" 
              />
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <div className="mb-4">
                <span className="font-label-sm text-label-sm text-secondary uppercase border border-outline-variant px-2 py-1">Moderately Strong</span>
              </div>
              <h3 className="font-instrument text-headline-md text-primary mb-4">Case Position</h3>
              <p className="font-body-md text-secondary leading-relaxed">Based on the available information, the user's position appears reasonably supported by the documented agreement terms.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
