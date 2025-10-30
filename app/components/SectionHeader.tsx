import { cn } from "~/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon?: {
    tone?: "indigo" | "amber" | "emerald";
    Icon?: LucideIcon;
  };
  title: string;
  eyebrow?: string;
  badge?: {
    label: string;
    value: number;
  };
  description?: string;
}

const iconPalette: Record<"indigo" | "amber" | "emerald", string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

const SectionHeader = ({
  icon,
  title,
  eyebrow,
  badge,
  description,
}: SectionHeaderProps) => {
  const iconTone: "indigo" | "amber" | "emerald" = icon?.tone ?? "indigo";
  return (
    <div className="flex w-full flex-wrap items-start justify-between gap-4 py-1 md:flex-nowrap md:items-center">
      <div className="flex flex-1 items-start gap-4">
        {icon && icon.Icon && (
          <span
            className={cn(
              "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg",
              iconPalette[iconTone],
            )}
          >
            <icon.Icon className="h-5 w-5" />
          </span>
        )}
        <div className="flex flex-col gap-1">
          {eyebrow && (
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-400">
              {eyebrow}
            </span>
          )}
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-sm leading-6 text-slate-600">{description}</p>
          )}
        </div>
      </div>

      {badge && (
        <div className="flex shrink-0 flex-col items-end gap-1 rounded-2xl bg-indigo-50/60 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-400">
            {badge.label}
          </span>
          <span className="text-2xl font-semibold text-slate-900">
            {badge.value}
          </span>
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
