"use client";

import { useState, useEffect } from "react";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Explicit map from nav URL → actual section element id in the DOM
const NAV_URL_TO_SECTION_ID: Record<string, string> = {
  "/": "home",
  "/problems": "the-problem",
  "/process": "process",
  "/workspace": "workspace",
  "/insights": "legal-insights",
  "/faq": "faq",
};

type NavbarSession = {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
} | null;

export function Navbar({ session }: { session: NavbarSession }) {
  const [activeId, setActiveId] = useState("/");
  const pathname = usePathname();
  const router = useRouter();

  const isCasesRoute = pathname.startsWith("/cases");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");

  useEffect(() => {
    // Only run scroll-spy on the home page (where all sections are mounted)
    if (pathname !== "/") return;

    const observers: IntersectionObserver[] = [];

    // Track visibility ratio for each section so we can pick the most visible one
    const visibilityMap: Record<string, number> = {};

    const pickActive = () => {
      // Choose the nav URL whose section has the highest intersection ratio
      let bestUrl = "/";
      let bestRatio = -1;
      for (const [url, ratio] of Object.entries(visibilityMap)) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestUrl = url;
        }
      }
      setActiveId(bestUrl);
    };

    navItems.forEach((item) => {
      const sectionId = NAV_URL_TO_SECTION_ID[item.url];
      if (!sectionId) return;
      const el = document.getElementById(sectionId);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          visibilityMap[item.url] = entry.intersectionRatio;
          pickActive();
        },
        {
          // Fire when the section crosses 10 % / 30 % / 50 % visibility thresholds
          threshold: [0, 0.1, 0.3, 0.5],
          // Shrink the root viewport so items activate around the nav bar height
          rootMargin: "-80px 0px -40% 0px",
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [pathname]);

  const isActive = (url: string) => {
    if (pathname === "/") {
      return activeId === url;
    }
    return pathname === url;
  };

  // 1. Authenticated Cases Page Navbar View
  if (isCasesRoute || isAuthRoute) {
    return null;
  }

  // 2. Default Public Page Navbar View
  return (
    <nav className="fixed top-0 w-full z-50 bg-white border-b border-surface-container px-[64px] py-[16px] flex justify-between items-center transition-all duration-300">
      <Link
        href="/"
        className="font-normal tracking-tight text-primary hover:text-primary transition-opacity duration-300 font-instrument italic text-headline-md"
      >
        Nyaya AI<sup className="">®</sup>
      </Link>
      <div className="hidden md:flex items-center space-x-12">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            className={cn(
              "transition-opacity duration-300 font-body-md text-body-md hover:text-primary cursor-pointer",
              isActive(item.url) ? "text-primary font-medium" : "text-secondary"
            )}
          >
            {item.title}
          </Link>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => router.push("/signup")}
          className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary text-on-primary font-body-md text-[13px] leading-[20px] hover:scale-[1.02] transition-transform duration-300 ease-out cursor-pointer"
        >
          Begin Journey
        </button>
      </div>
    </nav>
  );
}

