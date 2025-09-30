import { useId, useMemo } from "react";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const radius = 44;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = Math.max(0, Math.min(score, 100)) / 100;
  const strokeDashoffset = useMemo(
    () => circumference * (1 - progress),
    [circumference, progress],
  );
  const gradientId = useId();

  return (
    <div
      className="relative h-[120px] w-[120px]"
      role="img"
      aria-label={`Overall score ${score} out of 100`}
    >
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 120 120"
        className="-rotate-90 transform"
      >
        <defs>
          <linearGradient id={gradientId} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f97373" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={normalizedRadius}
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
        />
        <circle
          cx="60"
          cy="60"
          r={normalizedRadius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="drop-shadow-[0_6px_25px_rgba(99,102,241,0.35)]"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 leading-none">
          Score
        </span>
        <span className="text-2xl font-bold leading-none text-slate-900 mt-0.5">
          {score}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 leading-none">
          /100
        </span>
      </div>
    </div>
  );
};

export default ScoreCircle;
