import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { resendVerification } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { usePageMeta } from "@/lib/use-page-meta";

export function AuthPage() {
  usePageMeta("Sign in — Inkline Journal", "Sign in to Inkline Journal to write your story.");

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading, logInWithEmail, signUpWithEmail, logInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  const mode = useMemo<"signin" | "signup">(
    () => (searchParams.get("mode") === "signup" ? "signup" : "signin"),
    [searchParams],
  );
  const verificationState = searchParams.get("verified");
  const verificationMode = searchParams.get("verification");
  const verificationSent = verificationMode === "sent";
  const verificationRequired = verificationMode === "required";
  const verificationEmail = searchParams.get("email") ?? email;

  useEffect(() => {
    if (!loading && user) {
      navigate("/app", { replace: true, state: location.state });
    }
  }, [loading, user, navigate, location.state]);

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery && !email) {
      setEmail(emailFromQuery);
    }
  }, [searchParams, email]);

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      if (mode === "signup") {
        const result = await signUpWithEmail(displayName, email, password);
        setPassword("");
        setSearchParams({ mode: "signin", verification: "sent", email: result.email });
        toast.success(result.message);
      } else {
        await logInWithEmail(email, password);
        toast.success("Welcome back.");
        navigate("/app");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      if (mode === "signin" && message === "Verify your email before signing in.") {
        setSearchParams({ mode: "signin", verification: "required", email });
      }
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResendVerification() {
    if (!verificationEmail) {
      toast.error("Enter your email first.");
      return;
    }

    setResendBusy(true);
    try {
      const response = await resendVerification({ email: verificationEmail });
      toast.success(response.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend the verification email.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <MarketingLayout>
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="eyebrow mb-3">{mode === "signup" ? "Begin" : "Welcome back"}</div>
            <h1 className="font-display text-4xl md:text-5xl tracking-tight">
              {mode === "signup" ? "Create your journal." : "Sign in."}
            </h1>
            <p className="mt-3 text-ink-soft">
              {mode === "signup"
                ? "Drafts stay private until you decide otherwise."
                : "Welcome back. Your drafts are waiting."}
            </p>
          </div>

          <div className="rounded-2xl bg-card border border-rule p-7 space-y-5 shadow-[0_20px_50px_-30px_rgba(80,50,30,0.3)]">
            {verificationSent ? (
              <div className="rounded-2xl border border-rule bg-paper-warm px-4 py-4 text-sm text-ink-soft">
                <div className="font-medium text-ink">Check your email</div>
                <p className="mt-1">
                  We sent a verification link to <span className="text-ink">{verificationEmail}</span>. Open it before signing in.
                </p>
                <button
                  type="button"
                  disabled={resendBusy}
                  onClick={handleResendVerification}
                  className="mt-3 text-terracotta hover:underline disabled:opacity-60"
                >
                  {resendBusy ? "Sending..." : "Send another link"}
                </button>
              </div>
            ) : null}

            {verificationState === "success" ? (
              <div className="rounded-2xl border border-rule bg-paper-warm px-4 py-4 text-sm text-ink-soft">
                <div className="font-medium text-ink">Email verified</div>
                <p className="mt-1">You can sign in now.</p>
              </div>
            ) : null}

            {verificationState === "invalid" ? (
              <div className="rounded-2xl border border-rule bg-paper-warm px-4 py-4 text-sm text-ink-soft">
                <div className="font-medium text-ink">That link is no longer valid</div>
                <p className="mt-1">Request a new verification email and try again.</p>
                {verificationEmail ? (
                  <button
                    type="button"
                    disabled={resendBusy}
                    onClick={handleResendVerification}
                    className="mt-3 text-terracotta hover:underline disabled:opacity-60"
                  >
                    {resendBusy ? "Sending..." : "Send another link"}
                  </button>
                ) : null}
              </div>
            ) : null}

            {verificationRequired ? (
              <div className="rounded-2xl border border-rule bg-paper-warm px-4 py-4 text-sm text-ink-soft">
                <div className="font-medium text-ink">Verify your email first</div>
                <p className="mt-1">
                  Your account is almost ready. Open the verification email for{" "}
                  <span className="text-ink">{verificationEmail}</span> before signing in.
                </p>
                <button
                  type="button"
                  disabled={resendBusy}
                  onClick={handleResendVerification}
                  className="mt-3 text-terracotta hover:underline disabled:opacity-60"
                >
                  {resendBusy ? "Sending..." : "Send another link"}
                </button>
              </div>
            ) : null}

            <button
              type="button"
              disabled={busy}
              onClick={logInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-full border border-rule bg-paper hover:bg-paper-warm transition disabled:opacity-60"
            >
              <GoogleIcon />
              <span className="font-medium">
                {mode === "signup" ? "Create account with Google" : "Continue with Google"}
              </span>
            </button>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-soft">
              <div className="flex-1 h-px bg-rule" />
              <span>or with email</span>
              <div className="flex-1 h-px bg-rule" />
            </div>

            <form onSubmit={handleEmail} className="space-y-3">
              {mode === "signup" && (
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-rule bg-paper focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                />
              )}
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-rule bg-paper focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-rule bg-paper focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full px-5 py-3 rounded-full bg-ink text-paper font-medium hover:bg-ink/85 transition disabled:opacity-60"
              >
                {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <button
              type="button"
              onClick={() => setSearchParams({ mode: mode === "signup" ? "signin" : "signup" })}
              className="w-full text-sm text-ink-soft hover:text-ink"
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-ink-soft">
            By continuing you agree to our{" "}
            <Link to="/terms" className="hover:text-ink">terms</Link> and{" "}
            <Link to="/privacy" className="hover:text-ink">privacy policy</Link>.
          </p>
        </div>
      </main>
    </MarketingLayout>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.83z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
