import { useState, type FormEvent } from "react";

interface ImportFromSiteModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onImport: (url: string) => Promise<void>;
}

const ImportFromSiteModal = ({
  isOpen,
  onCancel,
  onImport,
}: ImportFromSiteModalProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onImport(url.trim());
      setUrl("");
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to import job posting",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUrl("");
    setError("");
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div
        className="surface-card surface-card--tight mx-4 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Import from job posting
            </h2>
            <p className="text-sm text-slate-600">
              Enter the URL of a job posting and we'll automatically extract the
              company name, position, and job description.
            </p>
          </div>

          <div className="input-wrapper">
            <label htmlFor="job-url" className="input-label required">
              Job posting URL
            </label>
            <input
              type="url"
              id="job-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/careers/senior-developer"
              className="input-field"
              disabled={isLoading}
              required
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex-1 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-indigo-700 hover:to-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportFromSiteModal;
