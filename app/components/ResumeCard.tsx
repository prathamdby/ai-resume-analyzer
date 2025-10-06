import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";
import { useEffect, useMemo, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
  onDelete,
}: {
  resume: Resume;
  onDelete?: (id: string) => void;
}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const hasFeedback = typeof feedback === "object" && feedback !== null;

  const overallScore = hasFeedback ? feedback.overallScore : undefined;

  const highlightCategories = useMemo(() => {
    if (!hasFeedback) return [] as { label: string; score: number }[];

    const pairs: { label: string; score: number }[] = [
      { label: "Tone & Style", score: feedback.toneAndStyle.score },
      { label: "Content", score: feedback.content.score },
      { label: "Structure", score: feedback.structure.score },
      { label: "Skills", score: feedback.skills.score },
    ];

    return pairs.sort((a, b) => b.score - a.score).slice(0, 2);
  }, [hasFeedback, feedback]);

  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };

    loadResume();
  }, [imagePath]);

  return (
    <div className="relative">
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-red-200/70 bg-white/95 text-red-600 shadow-sm backdrop-blur transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 hover:shadow-md focus-visible:ring-2 focus-visible:ring-red-200/70 focus-visible:ring-offset-2"
          aria-label={`Delete ${companyName || "resume"}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <Link
        to={`/resume/${id}`}
        className="group resume-card animate-in fade-in duration-700"
        aria-label={`View resume analysis for ${companyName || "this resume"}`}
      >
        <div className="resume-card-header">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              {companyName ? "Application" : "Draft"}
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {companyName || "Untitled resume"}
            </h3>
            <p className="text-sm font-medium text-slate-500">
              {jobTitle || "Add a target job to personalize guidance"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {overallScore !== undefined ? (
              <ScoreCircle score={overallScore} />
            ) : (
              <div className="rounded-full border border-dashed border-slate-200 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                Processing
              </div>
            )}
          </div>
        </div>

      {resumeUrl ? (
        <div className="gradient-border resume-card__preview">
          <img
            src={resumeUrl}
            alt={
              companyName ? `${companyName} resume preview` : "Resume preview"
            }
            className="h-[320px] w-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="resume-card__preview flex h-[320px] items-center justify-center bg-slate-100 text-sm text-slate-500">
          Preview will appear after upload completes
        </div>
      )}

      {hasFeedback && (
        <div className="flex flex-col gap-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-700">Top strengths</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {highlightCategories.map((category) => (
              <li
                key={`${id}-${category.label}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-indigo-50/40 px-3 py-2 text-slate-600"
              >
                <span className="text-sm font-medium text-slate-700">
                  {category.label}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {category.score}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <span className="mt-auto flex items-center justify-between text-sm font-semibold text-indigo-600">
        View detailed analysis
        <svg
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
    </div>
  );
};

export default ResumeCard;
