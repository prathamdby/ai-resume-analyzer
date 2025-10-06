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
  const clampedScore = Math.max(0, Math.min(score, 100));
  const isStrong = clampedScore >= 80;
  const isGood = clampedScore >= 60 && clampedScore < 80;
  const isFair = clampedScore >= 40 && clampedScore < 60;

  const palette = isStrong
    ? {
        background: "bg-emerald-100/80",
        text: "text-emerald-700",
        label: "On target",
      }
    : isGood
      ? {
          background: "bg-indigo-100/80",
          text: "text-indigo-700",
          label: "Getting close",
        }
      : isFair
        ? {
            background: "bg-amber-100/70",
            text: "text-amber-700",
            label: "Needs lifts",
          }
        : {
            background: "bg-rose-100/80",
            text: "text-rose-700",
            label: "Focus area",
          };

  return (
    <span
      className={cn(
        "score-badge",
        palette.background,
        palette.text,
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm"
      )}
      aria-label={`Score ${clampedScore} out of 100, ${palette.label}`}
    >
      {showLabel && (
        <span className="font-medium tracking-tight">{palette.label}</span>
      )}
      {showScore && (
        <span className="font-semibold text-slate-900/70">
          {clampedScore}
          <span className="text-[11px] font-medium uppercase text-slate-500">
            /100
          </span>
        </span>
      )}
    </span>
  );
};

export default ScoreBadge;
