"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";

const PENDING_HERO_PROMPT_KEY = "nyaya.pendingHeroPrompt";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

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

  const handleGoogleStart = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    window.localStorage.setItem(PENDING_HERO_PROMPT_KEY, prompt);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/cases",
      });
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setIsSigningIn(false);
    }
  };

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
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleGoogleStart();
                }
              }}
              disabled={isSigningIn}
            />
          </div>
          <button
            type="button"
            onClick={handleGoogleStart}
            disabled={isSigningIn}
            className="h-16 w-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-[1.05] transition-transform duration-300 cursor-pointer disabled:cursor-wait disabled:opacity-70"
            aria-label="Continue with Google"
          >
            {isSigningIn ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ArrowRight className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
