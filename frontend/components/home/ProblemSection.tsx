import { images } from "@/constants/image";
import Image from "next/image";

export function ProblemSection() {
  return (
    <section
      id="the-problem"
      className="w-full py-section-gap bg-surface-container-lowest relative z-30"
      style={{
        background:
          "linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 252, 248) 100%)",
      }}
    >
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-gutter items-center">

          {/* Left Column — 5 cols, text, appears second on mobile */}
          <div className="md:col-span-5 flex flex-col justify-center order-2 md:order-1 text-left">
            <h2
              className="font-instrument text-[56px] md:text-[90px] text-black mb-8"
              style={{ lineHeight: 1.1, letterSpacing: "0.02em" }}
            >
              <span className="text-primary italic">Most legal problems</span>{" "}
              <span className="text-secondary italic opacity-60">
                begin uncertainly.
              </span>
            </h2>

            <div className="font-body-lg text-body-lg text-secondary" style={{ lineHeight: 1.45 }}>
              <p>
                People receive notices, contracts, agreements and legal
                communications every day without knowing what they mean, how
                urgent they are,&nbsp;
              </p>
              <p>or what actions they require.</p>
            </div>
          </div>

          {/* Right Column — 7 cols, image, appears first on mobile */}
          <div className="md:col-span-7 order-1 md:order-2 flex justify-center">
            <Image
              alt="Abstract legal scales and pillars"
              className="w-full h-auto object-cover rounded-[2rem]"
              src={images.problemImage}
              width={900}
              height={600}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
