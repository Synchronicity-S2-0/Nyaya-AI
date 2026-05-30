import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { WorkspaceSection } from "@/components/home/WorkspaceSection";
import { LegalInsightsSection } from "@/components/home/LegalInsightsSection";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="bg-background text-on-background min-h-screen antialiased w-full">
      <HeroSection />
      <ProblemSection />
      <WorkspaceSection />
      <LegalInsightsSection />
      <Footer />
    </div>
  );
}
