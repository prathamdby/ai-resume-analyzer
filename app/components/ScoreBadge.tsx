import { cn } from "~/lib/utils";

interface ScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  showScore?: boolean;
  size?: "sm" | "md";
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  showLabel = true,
  showScore = true,
  size = "md",
}) => {
  const isStrong = score >= 70;
  const isGood = score >= 50 && score < 70;

  const background = isStrong
    ? "bg-badge-green"
    : isGood
      ? "bg-badge-yellow"
      : "bg-badge-red";

  const textClass = isStrong
    ? "text-badge-green-text"
    : isGood
      ? "text-badge-yellow-text"
      : "text-badge-red-text";

  const label = isStrong ? "Strong" : isGood ? "Good start" : "Needs work";

  return (
    <span
      className={cn(
        "score-badge",
        background,
        textClass,
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm",
      )}
      aria-label={`Score ${score} out of 100, ${label}`}
    >
      {showLabel && <span className="font-medium tracking-tight">{label}</span>}
      {showScore && (
        <span className="font-semibold text-slate-900/70">
          {score}
          <span className="text-[11px] font-medium uppercase text-slate-500">
            /100
          </span>
        </span>
      )}
    </span>
  );
};

export default ScoreBadge;
