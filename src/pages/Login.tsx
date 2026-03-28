import React from "react";
import { useNavigate } from "react-router-dom";
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
      "Invite activated. Check your email for confirmation if required, then sign in.",
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
    <div className="relative min-h-screen w-full overflow-hidden bg-page text-ink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,var(--accent-soft),transparent_52%),radial-gradient(circle_at_85%_15%,rgba(17,17,17,0.12),transparent_55%),linear-gradient(180deg,var(--page-bg),var(--surface-soft))]"></div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-[28px] border border-[color:var(--panel-border)] bg-[color:var(--panel-bg)] p-8 text-[color:var(--panel-text)] shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
          <div className="mb-6 flex items-center gap-2 rounded-full border border-[color:var(--panel-border)] bg-[color:var(--panel-muted)] p-1 text-body-sm">
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
              Activate Invite
            </button>
          </div>

          <form
            onSubmit={mode === "signin" ? handleSignIn : handleActivate}
            className="flex flex-col gap-4"
          >
            <label className="flex flex-col gap-2 text-body-sm">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-3 text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)] focus:border-accent"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-body-sm">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border border-[color:var(--panel-border)] bg-[color:var(--panel-input)] px-4 py-3 text-body-sm text-[color:var(--panel-text)] outline-none placeholder:text-[color:var(--panel-text-muted)] focus:border-accent"
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 text-body-xs text-[color:var(--panel-text-muted)]">
              <button
                type="button"
                onClick={handleReset}
                className="underline-offset-4 hover:text-[color:var(--panel-text)] hover:underline"
              >
                Forgot password?
              </button>
              <span>
                {mode === "activate"
                  ? "Invited editors should activate once, then sign in."
                  : "Need access? Ask an admin for an invite."}
              </span>
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
              className="mt-2 rounded-full bg-[color:var(--panel-text)] px-6 py-3 text-body-sm font-semibold text-[color:var(--panel-ink)] transition-opacity disabled:opacity-60"
            >
              {loading
                ? "Working..."
                : mode === "signin"
                  ? "Enter Dashboard"
                  : "Activate & Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
