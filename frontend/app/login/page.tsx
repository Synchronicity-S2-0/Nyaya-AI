import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { headers } from "next/headers";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/cases");
  }

  return (
    <main className="h-dvh overflow-hidden bg-surface text-on-surface selection:bg-primary selection:text-on-primary md:grid md:grid-cols-[55fr_45fr]">
      <section className="relative hidden h-dvh overflow-hidden border-r border-surface-container bg-[linear-gradient(135deg,#f5f5f7,#e8e8ea,#f9f9fb)] p-12 xl:p-margin-desktop md:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.85),transparent_30%),radial-gradient(circle_at_80%_85%,rgba(150,150,150,0.28),transparent_32%)]" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_200_200%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.65%22_numOctaves=%223%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />
        <div className="absolute left-[12%] top-[18%] h-[46rem] w-[46rem] rotate-[-18deg] rounded-[44%] border border-white/70 bg-white/35 shadow-[0_40px_160px_rgba(0,0,0,0.12)] backdrop-blur-sm" />
        <div className="absolute bottom-[-18%] right-[-12%] h-[36rem] w-[36rem] rotate-12 rounded-[38%] border border-black/10 bg-surface-container-high/70 shadow-[0_40px_140px_rgba(0,0,0,0.14)]" />
        <div className="absolute bottom-[18%] right-[18%] h-56 w-56 rotate-45 border-l border-t border-primary/20" />
        <div className="relative z-10 flex h-full w-full flex-col justify-between">
          <div className="font-instrument text-4xl font-normal tracking-tight text-primary">
            Nyaya AI
          </div>
          <div className="mb-10 max-w-xl">
            <h2 className="font-instrument text-[4.5rem] font-normal leading-[1.03] text-primary xl:text-[5rem]">
              Welcome to Nyaya.AI
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-secondary">
              Create your workspace and let Nyaya AI help you understand legal situations with confidence.
            </p>
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Legal clarity workspace
          </div>
        </div>
      </section>

      <section className="relative flex h-dvh items-center justify-center overflow-hidden bg-surface-container-lowest px-margin-mobile py-6 md:px-12 xl:px-margin-desktop">
        <div className="absolute left-margin-mobile top-margin-mobile font-instrument text-4xl text-primary md:hidden">
          Nyaya AI
        </div>
        <Suspense>
          <AuthForm />
        </Suspense>
      </section>
    </main>
  );
}
