import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { WorkspaceSection } from "@/components/home/WorkspaceSection";
import { LegalInsightsSection } from "@/components/home/LegalInsightsSection";

  return (
    <div className="bg-background text-on-background min-h-screen antialiased w-full">
      <HeroSection />
      <ProblemSection />
      <WorkspaceSection />
      <LegalInsightsSection />
    </div>
  );
}

