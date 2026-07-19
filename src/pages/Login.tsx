import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, KeyRound, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { cmsUser, roleLoading } = useAuth();
  const [mode, setMode] = React.useState<"signin" | "activate">("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!roleLoading && cmsUser?.is_active) {
      navigate("/dashboard", { replace: true });
    }
  }, [cmsUser, roleLoading, navigate]);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Signed in. Redirecting to dashboard...");
  };

  const handleActivate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage(
      "Invite accepted. Check your email for confirmation if required, then sign in.",
    );
  };

  const handleReset = async () => {
    if (!email) {
      setError("Enter the email address to reset the password.");
      return;
    }
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Password reset link sent. Check your email.");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[color:var(--panel-bg)] text-[color:var(--panel-text)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,213,0,0.18),transparent_32%),radial-gradient(circle_at_82%_18%,var(--accent-purple-soft),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_38%)]"></div>
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="hidden lg:flex min-h-[620px] flex-col justify-between rounded-[34px] border border-[color:var(--panel-border)] bg-[linear-gradient(150deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-[color:var(--panel-ink)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="mt-8 text-overline font-semibold text-accent">
              Christian Leaders CMS
            </p>
            <h1 className="mt-4 max-w-[520px] text-display-sm font-semibold text-inverse">
              Protected access for trusted ministry editors.
            </h1>
            <p className="mt-5 max-w-[460px] text-body-lg text-[color:var(--panel-text-muted)]">
              Sign in to manage content, accept an invite, or recover access
              without leaving the admin flow.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["Editorial content", "Event media", "Testimonials", "Access control"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-[color:var(--panel-border)] bg-[rgba(255,255,255,0.06)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl rounded-[32px] border border-[color:var(--panel-border)] bg-[rgba(18,22,33,0.78)] p-5 text-[color:var(--panel-text)] shadow-[0_30px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-7">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--panel-border)] bg-[rgba(255,255,255,0.06)] px-3 py-1.5 text-caption text-[color:var(--panel-text-muted)]">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Secure workspace
              </div>
              <h2 className="mt-4 text-heading-lg font-semibold text-inverse">
                {mode === "signin" ? "Welcome back" : "Accept your invite"}
              </h2>
              <p className="mt-2 text-body-sm text-[color:var(--panel-text-muted)]">
                {mode === "signin"
                  ? "Use your CMS email and password to continue."
                  : "Create a password with the email address your invite was sent to."}
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-2 rounded-[20px] border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-1 text-body-sm">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full px-4 py-2 transition-colors ${
                mode === "signin"
                  ? "bg-[color:var(--panel-text)] text-[color:var(--panel-ink)]"
                  : "text-[color:var(--panel-text-muted)] hover:text-[color:var(--panel-text)]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("activate")}
              className={`flex-1 rounded-full px-4 py-2 transition-colors ${
                mode === "activate"
                  ? "bg-[color:var(--panel-text)] text-[color:var(--panel-ink)]"
                  : "text-[color:var(--panel-text-muted)] hover:text-[color:var(--panel-text)]"
              }`}
            >
              Accept Invite
            </button>
          </div>

          <form
            onSubmit={mode === "signin" ? handleSignIn : handleActivate}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-2 text-body-sm text-[color:var(--panel-text-muted)]">
              Email
              <span className="flex items-center gap-3 rounded-[18px] border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-3 focus-within:border-accent">
                <Mail className="h-4 w-4 text-accent" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)]"
                  placeholder="you@example.com"
                  required
                />
              </span>
            </label>

            <label className="flex flex-col gap-2 text-body-sm text-[color:var(--panel-text-muted)]">
              Password
              <span className="flex items-center gap-3 rounded-[18px] border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-3 focus-within:border-accent">
                <KeyRound className="h-4 w-4 text-accent" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)]"
                  placeholder="Enter your password"
                  required
                />
              </span>
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 text-body-xs text-[color:var(--panel-text-muted)]">
              <button
                type="button"
                onClick={handleReset}
                className="underline-offset-4 hover:text-[color:var(--panel-text)] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-dashed border-[color:var(--danger)] bg-[rgba(185,28,28,0.12)] px-4 py-3 text-body-sm text-danger">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-dashed border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] px-4 py-3 text-body-sm text-[color:var(--panel-text-muted)]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-body-sm font-semibold text-[color:var(--panel-ink)] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              <span>
                {loading
                  ? "Working..."
                  : mode === "signin"
                    ? "Enter Dashboard"
                    : "Activate & Continue"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
