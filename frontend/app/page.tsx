import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { WorkspaceSection } from "@/components/home/WorkspaceSection";
import ProcessPage from "./process/page";
import InsightsPage from "./insights/page";
import FAQPage from "./faq/page";

export default function Page(){
  return (
    <div className="bg-background text-on-background min-h-screen antialiased w-full">
      <HeroSection />
      <ProblemSection />
      <ProcessPage />
      <WorkspaceSection />
      <InsightsPage />
      <FAQPage />
    </div>
  );
}

