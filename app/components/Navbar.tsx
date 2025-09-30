import { Link, useLocation } from "react-router";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { auth } = usePuterStore();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await auth.signOut();
    setIsMenuOpen(false);
    window.location.reload();
  };

  return (
    <header className="px-4 pt-4">
      <nav className="navbar" aria-label="Primary navigation">
        <Link to="/" className="navbar__brand" aria-label="Resumind home">
          <img
            src="/favicon.ico"
            alt="Resumind logo"
            className="h-10 w-10 rounded-full"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-500">
              Resumind
            </span>
            <span className="hidden text-sm font-medium text-slate-900 sm:block">
              AI resume insights
            </span>
          </span>
        </Link>

        <div className="navbar__links" role="navigation">
          <Link
            to="/"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              isHome
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            My Resumes
          </Link>
          <Link to="/upload" className="primary-button px-5 py-2.5 text-sm">
            Analyze Resume
          </Link>

          {auth.isAuthenticated && auth.user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:scale-105"
                aria-label="User menu"
                aria-expanded={isMenuOpen}
              >
                {auth.user.username.charAt(0).toUpperCase()}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Signed in as
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                        {auth.user.username}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="navbar__mobile gap-3">
          <Link
            to="/upload"
            className="primary-button px-5 py-2 text-sm"
            aria-label="Upload a resume"
          >
            Analyze
          </Link>

          {auth.isAuthenticated && auth.user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:scale-105"
                aria-label="User menu"
                aria-expanded={isMenuOpen}
              >
                {auth.user.username.charAt(0).toUpperCase()}
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Signed in as
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 truncate">
                        {auth.user.username}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
