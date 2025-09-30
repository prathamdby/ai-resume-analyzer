import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isUpload = location.pathname.startsWith("/upload");

  return (
    <header className="px-4 pt-4">
      <nav className="navbar" aria-label="Primary navigation">
        <Link to="/" className="navbar__brand" aria-label="Resumind home">
          <span className="navbar__brand-mark">R</span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-[0.38em] text-slate-500">
              Resumind
            </span>
            <span className="text-sm font-medium text-slate-900">
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
          <Link
            to="/upload"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium",
              isUpload
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            Upload
          </Link>
          <Link to="/upload" className="primary-button px-5 py-2.5 text-sm">
            Analyze Resume
          </Link>
        </div>

        <div className="navbar__mobile">
          <Link
            to="/upload"
            className="primary-button px-5 py-2 text-sm"
            aria-label="Upload a resume"
          >
            Analyze
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
