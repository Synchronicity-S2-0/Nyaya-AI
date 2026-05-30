"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { ArrowRight, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AuthMode = "signup" | "signin";

type AuthValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const initialValues: AuthValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

function firstError(errors: unknown[]) {
  return errors.length > 0 ? String(errors[0]) : "";
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const initialMode = searchParams.get("mode") === "signin"
    ? "signin"
    : searchParams.get("mode") === "signup"
    ? "signup"
    : pathname === "/login"
    ? "signin"
    : "signup";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [authError, setAuthError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const copy = useMemo(
    () =>
      mode === "signup"
        ? {
            title: "Create Account",
            description: "Set up your account in less than a minute.",
            submit: "Create Account",
            switchPrompt: "Already have an account?",
            switchAction: "Sign In",
          }
        : {
            title: "Welcome Back",
            description: "Sign in to continue your Nyaya AI workspace.",
            submit: "Sign In",
            switchPrompt: "New to Nyaya AI?",
            switchAction: "Create Account",
          },
    [mode],
  );

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      setAuthError("");

      if (mode === "signup") {
        if (value.password !== value.confirmPassword) {
          setAuthError("Passwords do not match.");
          return;
        }

        if (!value.terms) {
          setAuthError("Please accept the terms and privacy policy.");
          return;
        }

        await signUp.email({
          name: value.fullName,
          email: value.email,
          password: value.password,
          callbackURL: "/cases",
        });
      } else {
        await signIn.email({
          email: value.email,
          password: value.password,
          callbackURL: "/cases",
        });
      }

      router.push("/cases");
      router.refresh();
    },
  });

  const handleModeChange = (nextMode: AuthMode) => {
    setAuthError("");
    setMode(nextMode);
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;

    setAuthError("");
    setIsGoogleLoading(true);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/cases",
      });
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setAuthError("Google sign-in could not be started. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center justify-between w-full">
          <div className="font-instrument text-4xl font-normal leading-tight text-primary md:text-[2.8rem]">
            {copy.title}
          </div>
          <div className="inline-flex rounded-full bg-surface-container-low p-1">
            {(["signup", "signin"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleModeChange(item)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium text-secondary transition-colors",
                  mode === item && "bg-white text-primary shadow-sm",
                )}
              >
                {item === "signup" ? "Create" : "Sign in"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-secondary md:text-base">
        {copy.description}
      </p>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit().catch((error) => {
            console.error("Auth form failed:", error);
            setAuthError(
              "We could not complete this request. Please try again.",
            );
          });
        }}
      >
        {mode === "signup" && (
          <form.Field
            name="fullName"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? "Enter your full name." : undefined,
            }}
          >
            {(field) => (
              <div>
                <Label htmlFor={field.name}>Full Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  autoComplete="name"
                  placeholder="Jane Doe"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <p className="mt-1 min-h-4 text-xs text-error">
                  {firstError(field.state.meta.errors)}
                </p>
              </div>
            )}
          </form.Field>
        )}

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) =>
              /^\S+@\S+\.\S+$/.test(value)
                ? undefined
                : "Enter a valid email address.",
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name}>Email Address</Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="email"
                inputMode="email"
                placeholder="jane@example.com"
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <p className="mt-1 min-h-4 text-xs text-error">
                {firstError(field.state.meta.errors)}
              </p>
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length < 8 ? "Use at least 8 characters." : undefined,
          }}
        >
          {(field) => (
            <div>
              <Label htmlFor={field.name}>Password</Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder="Password"
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <p className="mt-1 min-h-4 text-xs text-error">
                {firstError(field.state.meta.errors)}
              </p>
            </div>
          )}
        </form.Field>

        {mode === "signup" && (
          <>
            <form.Field name="confirmPassword">
              {(field) => (
                <div>
                  <Label htmlFor={field.name}>Confirm Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="terms">
              {(field) => (
                <div className="flex items-start gap-3 pt-1">
                  <Checkbox
                    id={field.name}
                    name={field.name}
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(event.target.checked)
                    }
                  />
                  <label
                    htmlFor={field.name}
                    className="cursor-pointer text-sm leading-5 text-secondary md:text-base md:leading-6"
                  >
                    I agree to the{" "}
                    <Link
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      href="#"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      href="#"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              )}
            </form.Field>
          </>
        )}

        {authError && (
          <p className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container">
            {authError}
          </p>
        )}

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="mt-1 h-12 w-full"
              disabled={!canSubmit || isSubmitting || isGoogleLoading}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {copy.submit}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="my-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-surface-container" />
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-secondary">
          OR
        </span>
        <div className="h-px flex-1 bg-surface-container" />
      </div>

      <Button
        variant="secondary"
        className="h-12 w-full"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>

      <p className="mt-5 text-center text-sm text-secondary md:text-base">
        {copy.switchPrompt}{" "}
        <button
          type="button"
          onClick={() =>
            handleModeChange(mode === "signup" ? "signin" : "signup")
          }
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {copy.switchAction}
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
