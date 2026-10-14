import { AlertTriangle, Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ButtonSpinner } from "../../components/Loading";
import { useAuth } from "../../hooks/useAuth";
import { auth } from "../../lib/firebase";
import { getErrorMessage } from "../../lib/utils";

interface LocationState {
  from?: string;
  error?: string;
}

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(state.error ?? null);

  useEffect(() => {
    if (state.error) setError(state.error);
  }, [state.error]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(state.from ?? "/admin", { replace: true });
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) {
    return <Navigate to={state.from ?? "/admin"} replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-navy-700/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 -bottom-32 h-96 w-96 rounded-full bg-navy-600/30 blur-3xl" aria-hidden="true" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-sm font-medium text-steel-400 transition hover:text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
          Back to PallaviTraders website
        </Link>

        <div className="rounded-xl border border-navy-700/70 bg-white p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-navy-900 text-accent-500">
              <LockKeyhole className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-steel-900 uppercase">Admin Login</h1>
            <p className="mt-1.5 text-sm text-steel-600">Sign in to manage the PallaviTraders catalogue.</p>
          </div>

          {error ? (
            <div className="mt-5 flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-4 py-3" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <p className="text-sm leading-snug text-red-700">{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-steel-400" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-md border border-steel-300 py-2.5 pr-4 pl-9.5 text-sm text-steel-800 placeholder:text-steel-400 focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-steel-400" aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-steel-300 py-2.5 pr-11 pl-9.5 text-sm text-steel-800 placeholder:text-steel-400 focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-steel-400 transition hover:text-steel-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-navy-700 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <ButtonSpinner label="Signing in…" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 border-t border-steel-100 pt-5 text-center text-xs leading-relaxed text-steel-500">
            Admin access is restricted. Only accounts registered in the <code className="font-mono">admins</code>{" "}
            collection of Firestore can sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
