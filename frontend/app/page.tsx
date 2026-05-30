import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { WorkspaceSection } from "@/components/home/WorkspaceSection";

export default function Page(){
  return (
    <div className="bg-background text-on-background min-h-screen antialiased w-full">
      <HeroSection />
      <ProblemSection />
      <WorkspaceSection />
    </div>
  );
}

