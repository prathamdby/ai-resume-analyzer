import { useState } from "react";
import { CheckCheck, Copy, ListChecks, Undo2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

interface DiffCardProps {
  improvement: LineImprovement;
  onApply?: (improvementId: string) => void;
  isApplied?: boolean;
}

const getPriorityStyles = (priority: LineImprovement["priority"]) => {
  switch (priority) {
    case "high":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        label: "High Priority",
      };
    case "medium":
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        label: "Medium",
      };
    case "low":
      return {
        bg: "bg-slate-100",
        text: "text-slate-600",
        label: "Low",
      };
  }
};

const getCategoryLabel = (category: LineImprovement["category"]) => {
  switch (category) {
    case "quantify":
      return "Add Metrics";
    case "action-verb":
      return "Stronger Verb";
    case "keyword":
      return "Keyword Match";
    case "clarity":
      return "Clarity";
    case "ats":
      return "ATS-Friendly";
  }
};

const DiffCard = ({
  improvement,
  onApply,
  isApplied = false,
}: DiffCardProps) => {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(isApplied);
  const priorityStyles = getPriorityStyles(improvement.priority);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(improvement.suggested);
      setCopied(true);
      toast.success("Copied!", {
        description: "Suggestion copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Copy failed", {
        description: "Could not copy to clipboard",
      });
    }
  };

  const handleApply = () => {
    setApplied(!applied);
    onApply?.(improvement.sectionTitle + improvement.original);
    toast.success(applied ? "Unmarked" : "Marked as applied", {
      description: applied
        ? "Improvement unmarked"
        : "Great! Remember to update your resume",
    });
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm",
        applied && "ring-2 ring-emerald-200",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
          <span className="font-semibold uppercase tracking-[0.24em] text-slate-500">
            {improvement.sectionTitle}
          </span>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-semibold",
              priorityStyles.bg,
              priorityStyles.text,
            )}
          >
            {priorityStyles.label}
          </span>
          <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
            {getCategoryLabel(improvement.category)}
          </span>
          {applied && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <CheckCheck className="h-3 w-3" />
              Applied
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-indigo-600 transition hover:bg-indigo-50"
            type="button"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={handleApply}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold transition",
              applied
                ? "text-emerald-600 hover:bg-emerald-50"
                : "text-slate-600 hover:bg-slate-100",
            )}
            type="button"
          >
            {applied ? (
              <Undo2 className="h-4 w-4" />
            ) : (
              <ListChecks className="h-4 w-4" />
            )}
            {applied ? "Undo" : "Mark"}
          </button>
        </div>
      </div>
      <div className="divide-y divide-slate-100 text-sm">
        <div className="diff-block bg-red-50">
          <div className="diff-line minus">{improvement.original}</div>
        </div>
        <div className="diff-block bg-emerald-50">
          <div className="diff-line plus font-medium text-slate-900">
            {improvement.suggested}
          </div>
        </div>
      </div>
      <div className="border-t border-indigo-50 bg-indigo-50/60 px-4 py-3 text-sm text-slate-600">
        {improvement.reason}
      </div>
    </div>
  );
};

export default DiffCard;
