"use client";

import { useEffect, useRef } from "react";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch((e) => console.log("Video auto-play prevented:", e));
    video.style.opacity = "1";

    const handleTimeUpdate = () => {
      const duration = video.duration;
      const currentTime = video.currentTime;
      const fadeTime = 0.5; // seconds

      if (duration > 0) {
        if (currentTime < fadeTime) {
          video.style.opacity = String(currentTime / fadeTime);
        } else if (currentTime > duration - fadeTime) {
          video.style.opacity = String((duration - currentTime) / fadeTime);
        } else {
          video.style.opacity = "1";
        }
      }
    };

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <section id="home" className="relative w-full h-[100vh] bg-surface-container-lowest overflow-hidden flex flex-col items-center justify-center pt-[100px]">
      {/* Video Layer */}
      <div className="absolute inset-0 z-0 top-[300px]">
        <video
          ref={videoRef}
          className="w-full h-full object-cover transition-opacity duration-500 opacity-100"
          id="hero-video"
          muted
          playsInline
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-surface-container-lowest via-transparent to-surface-container-lowest pointer-events-none"></div>

      {/* Content Layer */}
      <div className="relative z-20 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center mt-[-25vh]">
        <h1 className="font-instrument font-normal text-[3rem] leading-[0.95] tracking-[-2.46px] md:text-8xl text-primary animate-fade-rise opacity-0">
          Legal <span className="text-[#6F6F6F]">uncertainty,</span>
          <br />
          made <span className="italic text-[#6F6F6F]">clear.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl mt-8 animate-fade-rise-delay opacity-0">
          Describe your problem or upload a document. Nyaya AI guides you through risks, rights, opportunities and next steps.
        </p>
        <div className="mt-12 w-full max-w-2xl animate-fade-rise-delay-2 opacity-0 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              className="w-full h-16 px-8 rounded-full bg-white border border-outline-variant focus:outline-none focus:border-primary font-body-md text-body-md placeholder:text-secondary-fixed-dim text-black shadow-sm"
              placeholder="Describe your legal problem..."
              type="text"
            />
          </div>
          <button className="h-16 w-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-[1.05] transition-transform duration-300 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
