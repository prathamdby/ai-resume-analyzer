import { useEffect, useId, useRef, useState } from "react";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);
  const percentage = Math.max(0, Math.min(score, 100)) / 100;
  const gradientId = useId();

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  return (
    <div className="surface-card flex flex-col items-center gap-4 bg-gradient-to-b from-indigo-50/70 via-white to-white">
      <div
        className="relative h-32 w-56"
        role="img"
        aria-label={`Overall resume score ${score} out of 100`}
      >
        <svg viewBox="0 0 100 60" className="h-full w-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - percentage)}
            className="drop-shadow-[0_12px_30px_rgba(99,102,241,0.25)]"
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 pt-6">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 leading-none">
            Overall
          </span>
          <span className="text-3xl font-bold leading-none text-slate-900 mt-1">
            {score}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400 leading-none">
            /100
          </span>
        </div>
      </div>
      <p className="max-w-xs text-center text-sm text-slate-600">
        This gauge blends tone, content, structure, and skills into a single
        confidence score for your current iteration.
      </p>
    </div>
  );
};

export default ScoreGauge;
