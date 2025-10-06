import ScoreBadge from "./ScoreBadge";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
}

const ATS: React.FC<ATSProps> = ({ score, suggestions }) => {
  const normalizedScore = Math.max(0, Math.min(score, 100));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <ScoreBadge score={normalizedScore} />
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-pink-400 transition-all duration-500"
            style={{ width: `${normalizedScore}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-slate-600">
            This score estimates how parser-friendly your resume is for
            automated tracking systems. Aim for 80 or above to maximize
            visibility in recruiter dashboards.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-500">
          Recommendations
        </h3>
        <ul className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.type}-${index}`}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3"
            >
              <span
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${suggestion.type === "good" ? "bg-green-100" : "bg-amber-100"}`}
              >
                <img
                  src={
                    suggestion.type === "good"
                      ? "/icons/check.svg"
                      : "/icons/warning.svg"
                  }
                  alt={
                    suggestion.type === "good"
                      ? "Positive signal"
                      : "Needs refinement"
                  }
                  className="h-5 w-5"
                />
              </span>
              <p className="text-sm text-slate-600">{suggestion.tip}</p>
            </li>
          ))}
        </ul>
        {suggestions.length === 0 && (
          <p className="text-sm text-slate-600">
            No suggestions yet. Re-run the analysis after applying updates to
            see how your ATS score responds.
          </p>
        )}
      </div>
    </div>
  );
};

export default ATS;
