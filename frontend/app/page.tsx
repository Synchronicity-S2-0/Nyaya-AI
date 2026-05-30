import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { WorkspaceSection } from "@/components/home/WorkspaceSection";

export default function Home() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans min-h-screen antialiased selection:bg-black selection:text-white">
      <HeroSection />
      <ProblemSection />
      <WorkspaceSection />
    </div>
  );
}
