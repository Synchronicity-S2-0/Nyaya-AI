"use client";

import { useEffect, useRef } from "react";

export function ProcessPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "50px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (lineRef.current) {
            lineRef.current.classList.add("scale-x-100");
            lineRef.current.classList.remove("scale-x-0");
          }

          const steps = sectionRef.current?.querySelectorAll(".step-item");
          steps?.forEach((step) => {
            step.classList.add("opacity-100", "translate-y-0");
            step.classList.remove("opacity-0", "translate-y-5");
          });

          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-background text-on-background antialiased selection:bg-primary selection:text-on-primary min-h-screen pt-[120px] pb-32">
      <section
        ref={sectionRef}
        className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden"
        id="process"
      >
        <div className="mb-24 md:mb-32 grid grid-cols-1 md:grid-cols-2 gap-gutter items-end">
          <h2 className="font-display-lg-mobile md:font-display-lg text-primary max-w-xl leading-tight">
            From uncertainty to <br />
            <i className="italic text-secondary">action.</i>
          </h2>
          <div className="flex justify-end">
            <p className="font-body-lg text-body-lg text-secondary max-w-md">
              We've distilled the complexity of legal systems into a clear, four-step
              journey. Nyaya AI provides the clarity needed to navigate notices,
              contracts, and procedural hurdles with confidence and precision.
            </p>
          </div>
        </div>

        <div className="relative w-full">
          {/* Continuous Line (Desktop) */}
          <div
            ref={lineRef}
            className="hidden md:block absolute top-6 left-0 w-full h-[1px] bg-outline-variant origin-left scale-x-0 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
          ></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative z-10">
            {/* Step 01 */}
            <div className="step-item opacity-0 translate-y-5 transition-all duration-[800ms] ease-out delay-[200ms] flex flex-row md:flex-col gap-6 md:gap-0">
              <div className="flex-shrink-0 w-12 md:w-auto md:mb-8">
                <span className="font-label-md text-label-md text-secondary block md:bg-background md:inline-block md:pr-4">
                  01
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">
                  Upload a Document
                </h3>
                <p className="font-body-md text-body-md text-secondary">
                  Upload notices, contracts, FIRs, agreements or legal communications.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="step-item opacity-0 translate-y-5 transition-all duration-[800ms] ease-out delay-[400ms] flex flex-row md:flex-col gap-6 md:gap-0">
              <div className="flex-shrink-0 w-12 md:w-auto md:mb-8">
                <span className="font-label-md text-label-md text-secondary block md:bg-background md:inline-block md:pr-4">
                  02
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">
                  Describe Your Situation
                </h3>
                <p className="font-body-md text-body-md text-secondary">
                  Explain your problem in plain language.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="step-item opacity-0 translate-y-5 transition-all duration-[800ms] ease-out delay-[600ms] flex flex-row md:flex-col gap-6 md:gap-0">
              <div className="flex-shrink-0 w-12 md:w-auto md:mb-8">
                <span className="font-label-md text-label-md text-secondary block md:bg-background md:inline-block md:pr-4">
                  03
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">
                  Understand Your Position
                </h3>
                <p className="font-body-md text-body-md text-secondary">
                  Receive risks, protections and procedural guidance.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="step-item opacity-0 translate-y-5 transition-all duration-[800ms] ease-out delay-[800ms] flex flex-row md:flex-col gap-6 md:gap-0">
              <div className="flex-shrink-0 w-12 md:w-auto md:mb-8">
                <span className="font-label-md text-label-md text-secondary block md:bg-background md:inline-block md:pr-4">
                  04
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary mb-4">
                  Take Action
                </h3>
                <p className="font-body-md text-body-md text-secondary">
                  Generate responses and next-step documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProcessPage;
