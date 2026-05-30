'use client';

import { navItems } from '@/constants';
import { signIn } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const path = usePathname();
  const isActive = "underline"

  const handleLogin = async () => {
    const data = await signIn.social({
      provider: "google"
    })
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.opacity = '1';
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans min-h-screen antialiased selection:bg-black selection:text-white">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 md:px-16 py-8 bg-transparent">
        <div className="text-[1.875rem] font-serif text-black">
          Nyaya AI<sup className="text-sm">®</sup>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item: NavItems) => (
            <Link className={cn('text-black pb-1 hover:opacity-80 transition-all duration-500 ease-in-out cursor-pointer', path === item.url ? isActive : '')} href={item.url} key={item.id}>
              {item.title}
            </Link>
          ))}
        </div>
        <button onClick={handleLogin} className="bg-black text-white px-6 py-3 hover:bg-[#1b1b1b] transition-all duration-500 ease-in-out hidden md:block uppercase tracking-widest font-bold rounded-full cursor-pointer text-xs">
          BEGIN JOURNEY
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen w-full overflow-hidden bg-white flex flex-col justify-start pt-48 pb-16">
        {/* Background Video with Gradient Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ top: '15vh' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover opacity-0 transition-opacity duration-1000"
            muted
            playsInline
            loop
            autoPlay
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white via-transparent to-white pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-16 w-full text-center">
          <h1 className="text-5xl md:text-[84px] font-serif mb-8 leading-[0.95] max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000">
            Legal <span className="italic text-[#6F6F6F]">uncertainty,</span><br />made <span className="italic text-[#6F6F6F]">clear.</span>
          </h1>
          <div className="text-lg md:text-[18px] text-[#5e5e5e] mx-auto mb-12 font-medium max-w-[540px] animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200 fill-mode-both">
            <div>Describe your situation in your own words.</div>
            <div>Nyaya AI transforms legal complexity into practical understanding.</div>
          </div>
          
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-500 fill-mode-both">
            <div className="relative flex items-center bg-white rounded-full border border-gray-200 shadow-sm p-2 hover:shadow-md transition-shadow duration-300">
              <input 
                className="flex-grow bg-transparent border-none focus:ring-0 text-lg px-6 py-4 placeholder-gray-400 text-black w-full outline-none" 
                placeholder="Describe your legal issue" 
                type="text" 
              />
              <button className="flex-shrink-0 bg-black text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-[#1b1b1b] transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-white py-32 overflow-hidden" id="problem">
        <div className="max-w-[1440px] mx-auto px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-start mb-24">
            <div>
              <h2 className="text-4xl md:text-[48px] font-serif text-black leading-tight max-w-md">
                Most legal problems begin with uncertainty.
              </h2>
            </div>
            <div className="md:pt-4">
              <p className="text-lg text-[#5e5e5e]">
                People receive notices, contracts, agreements and legal communications every day without understanding their meaning, urgency or consequences.
              </p>
            </div>
          </div>
          <div className="w-full">
            <img 
              alt="Artistic paper sculptures symbolizing legal document flow" 
              className="w-full h-auto object-cover rounded-xl" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0OZOnXt6AlQjiYUVIQVTxHs4P3bBcoFWrZBhPYCE-fnAzJNjv4fTpRo9GN8GQOPu1bM7VKuBn7eT-zI6iQMH_a6ZuuM6b4366W7lcR6xB3XZlJ-rfCSnaSW_qj429fB_HTRNLPaW6oO4uLD8rbrtIZuh2hqzyGnZK4o4ki2sYR_h57lvqn2VGc17BRPDM7QLZo1UgGm3VqWewKesQsuoj2S4EvmV5uqNTEpQOOc6HrKvwZtfqB-CImAYbWQQAXFT4h513zk2HC4U" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}
