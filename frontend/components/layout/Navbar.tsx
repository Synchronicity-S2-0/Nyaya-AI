"use client";

import { useState, useEffect } from "react";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
    const handleScroll = () => {
      // Only do scroll spy on the home page
      if (pathname !== "/") return;

      const sections = navItems
        .map((item) => {
          const id = item.url === "/" ? "home" : (item.url === "/problem" ? "the-problem" : item.url.replace("/", ""));
          const element = document.getElementById(id);
          if (element) {
            const rect = element.getBoundingClientRect();
            // We consider a section "active" if its top is near the top of the viewport
            return { id: item.url, top: rect.top, bottom: rect.bottom };
          }
          return null;
        })
        .filter(Boolean) as { id: string; top: number; bottom: number }[];

      // Find the first section that occupies the upper part of the viewport
      const currentSection = sections.find(
        (section) => section && section.top <= 160 && section.bottom >= 160
      );

      if (currentSection) {
        setActiveId(currentSection.id);
      } else if (window.scrollY < 100) {
        setActiveId("/");
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
        className="font-headline-md text-[26px] leading-[32px] font-normal tracking-tight text-primary italic hover:scale-[1.02] duration-500 ease-in-out hover:text-primary transition-all font-instrument"
      >
        Nyaya AI<sup className="">®</sup>
      </Link>
      
      <div className="hidden md:flex items-center space-x-8">
        {navItems.map((item) => {
          const id = item.url === "/" ? "home" : (item.url === "/problem" ? "the-problem" : item.url.replace("/", ""));
          const href = pathname === "/" ? `#${id}` : item.url;
          return (
            <Link
              key={item.id}
              href={href}
              className={cn(
                "transition-opacity duration-300 font-body-md text-[13px] leading-[20px] hover:text-primary cursor-pointer",
                isActive(item.url) ? "text-primary font-medium" : "text-secondary"
              )}
            >
              {item.title}
            </Link>
          );
        })}
      </div>

      <div className="flex gap-4 items-center">
        <button
          onClick={() => router.push("/login")}
          className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 font-body-md text-[13px] leading-[20px] hover:bg-gray-50 transition-all cursor-pointer font-medium"
        >
          Sign In
        </button>

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

