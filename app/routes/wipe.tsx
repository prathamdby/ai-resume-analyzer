import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import { usePuterStore } from "~/lib/puter";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [isClearing, setIsClearing] = useState(false);

  const loadFiles = async () => {
    const items = (await fs.readDir("./")) as FSItem[];
    setFiles(items);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  const handleDelete = async () => {
    if (files.length === 0) return;
    setIsClearing(true);
    await Promise.all(
      files.map(async (file) => {
        await fs.delete(file.path);
      }),
    );
    await kv.flush();
    await loadFiles();
    setIsClearing(false);
  };

  if (error) {
    return (
      <main className="relative overflow-hidden">
        <Navbar />
        <section className="page-shell">
          <div className="surface-card surface-card--tight space-y-4">
            <h1 className="text-2xl font-semibold text-red-600">We ran into an issue</h1>
            <p className="text-sm text-slate-600">{String(error)}</p>
            <button className="primary-button primary-button--ghost" onClick={clearError}>
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="relative overflow-hidden">
        <Navbar />
        <section className="page-shell">
          <div className="surface-card surface-card--tight text-sm text-slate-600">
            Loading workspace data...
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <section className="page-shell gap-12">
        <header className="flex flex-col gap-3">
          <span className="section-eyebrow w-fit">Maintenance</span>
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">Manage your stored files</h1>
          <p className="text-base text-slate-600">
            Remove generated resumes, previews, or cached data from your Puter workspace with a
            single action.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <aside className="surface-card surface-card--tight space-y-4">
            <h2 className="text-base font-semibold text-slate-900">Account overview</h2>
            <dl className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-700">User</dt>
                <dd>{auth.user?.username || "Unknown"}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-700">Files detected</dt>
                <dd>{files.length}</dd>
              </div>
            </dl>
            <button
              className="primary-button"
              onClick={handleDelete}
              disabled={files.length === 0 || isClearing}
            >
              {isClearing ? "Clearing..." : "Wipe stored data"}
            </button>
            <p className="text-xs text-slate-500">
              The wipe removes generated previews and feedback stored in Puter. Your resume analyses
              will need to be re-run afterward.
            </p>
          </aside>

          <section className="surface-card surface-card--tight space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Workspace files</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                {files.length} items
              </span>
            </div>
            {files.length === 0 ? (
              <p className="text-sm text-slate-600">No stored files found. You are all clear!</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm text-slate-600">
                {files.map((file) => (
                  <li key={file.id} className="flex items-center justify-between py-2">
                    <span className="font-medium text-slate-700">{file.name}</span>
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
                      {file.type}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default WipeApp;
