import type { Route } from "./+types/home";

import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import DeleteConfirmModal from "~/components/DeleteConfirmModal";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { toast } from "sonner";
import type { KVPair } from "@heyputer/puter.js";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    {
      name: "description",
      content: "Get personalized feedback to land your dream job",
    },
  ];
}

const heroInsights = [
  {
    label: "Average ATS uplift",
    value: "+18 pts",
    description: "after applying tailored feedback",
  },
  {
    label: "Resume variants tracked",
    value: "Unlimited",
    description: "keep every iteration organized",
  },
  {
    label: "Guided improvements",
    value: "Step-by-step",
    description: "actionable suggestions per category",
  },
];

export default function Home() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      try {
        const items = (await kv.list("resume:*", true)) as KVPair[];

        const parsedResumes: Resume[] = [];

        if (items && Array.isArray(items)) {
          for (const item of items) {
            try {
              const parsed = JSON.parse(item.value) as Resume;
              if (parsed && typeof parsed === "object" && parsed.id) {
                parsedResumes.push(parsed);
              }
            } catch (parseError) {
              console.error(`Failed to parse resume ${item.key}:`, parseError);
            }
          }
        }

        setResumes(parsedResumes);
      } catch (error) {
        console.error("Failed to load resumes:", error);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, []);

  const finishedResumes = useMemo(
    () => resumes.filter((resume) => !!resume.feedback),
    [resumes],
  );

  const hasResumes = finishedResumes.length > 0;

  const featuredResume = useMemo(() => {
    if (!hasResumes) return null;
    return finishedResumes[0];
  }, [finishedResumes, hasResumes]);

  const featuredScore =
    typeof featuredResume?.feedback === "object" && featuredResume.feedback
      ? featuredResume.feedback.overallScore
      : undefined;

  const handleDeleteResume = (id: string) => {
    const resume = resumes.find((r) => r.id === id);
    if (!resume) return;

    setResumeToDelete(resume);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;

    try {
      // Delete from KV store
      await kv.delete(`resume:${resumeToDelete.id}`);

      // Delete files from Puter FS
      try {
        await fs.delete(resumeToDelete.resumePath);
      } catch (e) {
        // File might not exist, continue
      }

      try {
        await fs.delete(resumeToDelete.imagePath);
      } catch (e) {
        // File might not exist, continue
      }

      // Update local state
      setResumes((prev) => prev.filter((r) => r.id !== resumeToDelete.id));

      toast.success("Resume deleted", {
        description: "The resume and its analysis have been removed.",
      });
    } catch (error) {
      toast.error("Delete failed", {
        description: "Failed to delete the resume. Please try again.",
      });
    } finally {
      setDeleteModalOpen(false);
      setResumeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setResumeToDelete(null);
  };

  return (
    <main className="relative overflow-hidden">
      <div className="hero-decor" aria-hidden="true" />
      <Navbar />

      <section className="page-shell gap-20">
        <header className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:items-start lg:gap-16">
          <div className="flex flex-col gap-8">
            <span className="section-eyebrow">
              Confidence for every application
            </span>
            <h1 className="headline">
              Track your resume performance and land the interview sooner
            </h1>
            <p className="subheadline">
              Resumind analyzes each submission, highlights what is working, and
              gives you the playbook to tailor your next iteration in minutes.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/upload" className="primary-button">
                Analyze a new resume
              </Link>
              <Link
                to="#resumes"
                className="primary-button primary-button--ghost px-5 py-2.5 text-sm"
              >
                Review past analyses
              </Link>
            </div>
          </div>

          <aside
            className="surface-card space-y-6 self-start"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
                  Spotlight
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {featuredResume?.companyName || "Your next role"}
                </p>
                <p className="text-sm text-slate-500">
                  {featuredResume?.jobTitle ||
                    "Run an analysis to see tailored advice"}
                </p>
              </div>
              {featuredScore !== undefined && (
                <div className="flex flex-col items-end gap-1 rounded-2xl bg-indigo-50/60 px-4 py-3 text-right">
                  <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                    Overall score
                  </span>
                  <span className="text-3xl font-semibold text-slate-900">
                    {featuredScore}
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-indigo-100/70 bg-indigo-50/40 px-4 py-3">
                <p className="font-semibold text-indigo-700">
                  Actionable feedback
                </p>
                <p className="mt-1 text-slate-600">
                  Every category comes with ready-to-apply guidance pulled from
                  ATS-friendly best practices.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3">
                <p className="font-semibold text-slate-800">
                  Visual resume preview
                </p>
                <p className="mt-1 text-slate-600">
                  Compare versions side-by-side and link directly to the source
                  PDF stored in Puter.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3">
                <p className="font-semibold text-slate-800">Secure storage</p>
                <p className="mt-1 text-slate-600">
                  Your resumes stay private; delete any analysis instantly from
                  the Wipe workspace.
                </p>
              </div>
            </div>
          </aside>

          <dl className="grid w-full grid-cols-1 items-stretch gap-6 pt-8 sm:grid-cols-3 lg:col-span-2">
            {heroInsights.map((insight) => (
              <div
                key={insight.label}
                className="surface-card surface-card--tight h-full text-left"
              >
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                  {insight.label}
                </dt>
                <dd className="mt-3 text-2xl font-semibold text-slate-900">
                  {insight.value}
                </dd>
                <p className="text-sm text-slate-500">{insight.description}</p>
              </div>
            ))}
          </dl>
        </header>

        <section id="resumes" className="section-shell gap-10">
          <div className="section-heading">
            <div className="flex flex-col gap-3 text-left">
              <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Your analyses at a glance
              </h2>
              <p className="text-base text-slate-600 sm:text-lg">
                Revisit past submissions, monitor improvements, and dive back
                into detailed insights anytime.
              </p>
            </div>
          </div>

          {loadingResumes && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="surface-card h-[320px] animate-pulse bg-white/70"
                  aria-hidden="true"
                />
              ))}
            </div>
          )}

          {!loadingResumes && hasResumes && (
            <div className="resumes-section">
              {finishedResumes.map((resume: Resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={handleDeleteResume}
                />
              ))}
            </div>
          )}

          {!loadingResumes && !hasResumes && (
            <div className="surface-card surface-card--tight mx-auto flex w-full max-w-3xl flex-col items-center gap-6 py-16 text-center">
              <div className="rounded-2xl bg-gradient-to-r from-indigo-100/80 to-pink-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-indigo-600">
                Getting started
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                No analyses yet. Your first upload unlocks personalized insights
              </h3>
              <p className="max-w-xl text-slate-600">
                Drag in a PDF resume, share the role you are focused on, and
                Resumind will return actionable guidance within seconds.
              </p>
              <Link to="/upload" className="primary-button px-5 py-3 text-sm">
                Upload your first resume
              </Link>
            </div>
          )}

          {!loadingResumes && hasResumes && (
            <div className="flex w-full justify-center pt-8">
              <Link
                to="/wipe"
                className="inline-flex items-center gap-2 rounded-full border border-red-200/70 bg-white/80 px-5 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md focus-visible:ring-red-200/70"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Wipe My Data
              </Link>
            </div>
          )}
        </section>
      </section>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={resumeToDelete?.companyName || "Untitled resume"}
      />
    </main>
  );
}
