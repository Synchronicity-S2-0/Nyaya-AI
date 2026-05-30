import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { WorkspaceSection } from "@/components/home/WorkspaceSection";
import ProcessPage from "./process/page";
import InsightsPage from "./insights/page";
import FAQPage from "./faq/page";

export default function Home() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] font-sans min-h-screen antialiased selection:bg-black selection:text-white">
      <HeroSection />
      <ProblemSection />
      <ProcessPage />
      <WorkspaceSection />
      <InsightsPage />
      <FAQPage />
    </div>
  );
}
