import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind | Auth" },
  { name: "description", content: "Log into your account" },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated && next) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <section className="page-shell">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-8 text-center">
          <span className="section-eyebrow mx-auto">Welcome back</span>
          <h1 className="headline text-4xl">Sign in to continue your career journey</h1>
          <p className="subheadline">
            Connect your Puter account to save resume versions, store analyses, and pick up where you
            left off.
          </p>

          <div className="surface-card surface-card--tight space-y-6">
            <p className="text-sm font-semibold text-indigo-600" aria-live="polite">
              {isLoading ? "Checking your session..." : auth.isAuthenticated ? "You are signed in." : "You are signed out."}
            </p>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <button className="primary-button" disabled>
                  Preparing sign-in
                </button>
              ) : auth.isAuthenticated ? (
                <button className="primary-button primary-button--ghost" onClick={auth.signOut}>
                  Sign out of Puter
                </button>
              ) : (
                <button className="primary-button" onClick={auth.signIn}>
                  Sign in with Puter
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Need to switch accounts? Sign out first, then sign in with your preferred Puter login.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Auth;
