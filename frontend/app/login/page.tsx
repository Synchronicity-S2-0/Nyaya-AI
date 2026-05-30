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
      <section className="relative hidden h-dvh overflow-hidden border-r border-neutral-800 bg-neutral-950 bg-[url('/login-bg.png')] bg-cover bg-center p-12 text-white xl:p-margin-desktop md:flex">
        <div className="absolute w-full inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/55" />
        <div className="relative z-10 flex h-full w-full items-end justify-start">
          <div className="mb-2 max-w-xl text-left">
            <h2 className="font-instrument text-[4.5rem] font-normal leading-[1.03] text-white xl:text-[5rem]">
              Welcome to Nyaya.AI
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-white/70">
              Create your workspace and let Nyaya AI help you understand legal
              situations with confidence.
            </p>
            <div className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
              Legal clarity workspace
            </div>
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
