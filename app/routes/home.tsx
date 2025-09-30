import type { Route } from "./+types/home";

import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Get personalized feedback to land your dream job" },
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
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const items = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = items?.map((resume) => JSON.parse(resume.value) as Resume);

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    loadResumes();
  }, []);

  const hasResumes = resumes.length > 0;

  const featuredResume = useMemo(() => {
    if (!hasResumes) return null;
    return resumes.find((resume) => !!resume.feedback) ?? resumes[0];
  }, [resumes, hasResumes]);

  const featuredScore =
    typeof featuredResume?.feedback === "object" && featuredResume.feedback
      ? featuredResume.feedback.overallScore
      : undefined;

  return (
    <main className="relative overflow-hidden">
      <div className="hero-decor" aria-hidden="true" />
      <Navbar />

      <section className="page-shell gap-20">
        <header className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)] lg:items-start lg:gap-16">
          <div className="flex flex-col gap-8">
            <span className="section-eyebrow">Confidence for every application</span>
            <h1 className="headline">
              Track your resume performance and land the interview sooner
            </h1>
            <p className="subheadline">
              Resumind analyzes each submission, highlights what is working, and gives you the
              playbook to tailor your next iteration in minutes.
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

          <aside className="surface-card space-y-6 self-start" aria-live="polite">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
                  Spotlight
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {featuredResume?.companyName || "Your next role"}
                </p>
                <p className="text-sm text-slate-500">
                  {featuredResume?.jobTitle || "Run an analysis to see tailored advice"}
                </p>
              </div>
              {featuredScore !== undefined && (
                <div className="flex flex-col items-end gap-1 rounded-2xl bg-indigo-50/60 px-4 py-3 text-right">
                  <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                    Overall score
                  </span>
                  <span className="text-3xl font-semibold text-slate-900">{featuredScore}</span>
                </div>
              )}
            </div>

            <div className="grid gap-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-indigo-100/70 bg-indigo-50/40 px-4 py-3">
                <p className="font-semibold text-indigo-700">Actionable feedback</p>
                <p className="mt-1 text-slate-600">
                  Every category comes with ready-to-apply guidance pulled from ATS-friendly best
                  practices.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3">
                <p className="font-semibold text-slate-800">Visual resume preview</p>
                <p className="mt-1 text-slate-600">
                  Compare versions side-by-side and link directly to the source PDF stored in Puter.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3">
                <p className="font-semibold text-slate-800">Secure storage</p>
                <p className="mt-1 text-slate-600">
                  Your resumes stay private; delete any analysis instantly from the Wipe workspace.
                </p>
              </div>
            </div>
          </aside>

          <dl className="grid w-full grid-cols-1 items-stretch gap-6 pt-8 sm:grid-cols-3 lg:col-span-2">
            {heroInsights.map((insight) => (
              <div key={insight.label} className="surface-card surface-card--tight h-full text-left">
                <dt className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                  {insight.label}
                </dt>
                <dd className="mt-3 text-2xl font-semibold text-slate-900">{insight.value}</dd>
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
                Revisit past submissions, monitor improvements, and dive back into detailed insights
                anytime.
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
              {resumes.map((resume: Resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          )}

          {!loadingResumes && !hasResumes && (
            <div className="surface-card surface-card--tight mx-auto flex max-w-2xl flex-col items-start gap-6 text-left">
              <div className="rounded-2xl bg-gradient-to-r from-indigo-100/80 to-pink-100/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-indigo-600">
                Getting started
              </div>
              <h3 className="text-2xl font-semibold text-slate-900">
                No analyses yet. Your first upload unlocks personalized insights
              </h3>
              <p className="text-slate-600">
                Drag in a PDF resume, share the role you are focused on, and Resumind will return
                actionable guidance within seconds.
              </p>
              <Link to="/upload" className="primary-button px-5 py-3 text-sm">
                Upload your first resume
              </Link>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}








