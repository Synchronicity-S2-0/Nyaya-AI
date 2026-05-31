"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import useTextStore from "@/store/useText";
import { useRouter } from "next/navigation";

const PENDING_HERO_PROMPT_KEY = "nyaya.pendingHeroPrompt";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { setText } = useTextStore();
  const router = useRouter();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((e) => console.log("Video auto-play prevented:", e));
      video.classList.remove("opacity-0");
      video.classList.add("opacity-100");

      const handleTimeUpdate = () => {
        const duration = video.duration;
        const currentTime = video.currentTime;
        const fadeTime = 0.5;

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
        video.play().catch((e) => console.log("Video play prevented:", e));
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
      };
    }
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
    <section
      id="home"
      className="relative w-full h-[100vh] bg-surface-container-lowest overflow-hidden flex flex-col items-center justify-center pt-[100px]"
    >
      {/* Video Layer — occupies full height */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover transition-opacity duration-500"
          id="hero-video"
          muted
          playsInline
          style={{ opacity: 1 }}
        >
          <source
            src="/videos/court.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Gradient Overlay — fades video into background at top & bottom */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-surface-container-lowest via-transparent to-surface-container-lowest pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-20 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col items-center text-center mt-[-25vh]">
        {/* Main headline — Instrument Serif, display-sized */}
        <h1 className="font-instrument font-normal text-[3rem] leading-[0.95] tracking-[-2.46px] md:text-8xl text-primary animate-fade-rise opacity-0">
          Legal <span className="text-[#6F6F6F]">uncertainty,</span>
          <br />
          made <span className="italic text-[#6F6F6F]">clear.</span>
        </h1>

        
        {/* Search / input row */}
        <div className="mt-10 mb-20 w-full max-w-2xl animate-fade-rise-delay-2 opacity-0 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              className="w-full h-16 px-8 rounded-full bg-white border border-outline-variant focus:outline-none focus:border-primary font-body-md text-body-md placeholder:text-secondary-fixed-dim"
              placeholder="Describe your legal problem..."
              type="text"
              value={prompt}
              onChange={(event) => {setText(event.target.value); setPrompt(event.target.value)}}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleGoogleStart();
                }
              }}
              disabled={isSigningIn}
            />
          </div>
          {/* Arrow button — Material Symbols icon replaced with inline SVG */}
          <button className="h-16 w-16 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-[1.05] transition-transform duration-300 cursor-pointer flex-shrink-0"
          
          onClick={() => router.push("/signup")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
