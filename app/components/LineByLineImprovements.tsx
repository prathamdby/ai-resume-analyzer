import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";
import DiffCard from "./DiffCard";
import { toast } from "sonner";

interface LineByLineImprovementsProps {
  improvements: LineImprovement[];
}

const LineByLineImprovements = ({
  improvements,
}: LineByLineImprovementsProps) => {
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Group improvements by section
  const groupedImprovements = useMemo(() => {
    const groups: Record<string, LineImprovement[]> = {};

    improvements.forEach((improvement) => {
      const section = improvement.section;
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(improvement);
    });

    // Sort sections in a logical order
    const sectionOrder: Array<LineImprovement["section"]> = [
      "summary",
      "experience",
      "education",
      "skills",
      "other",
    ];

    return sectionOrder
      .filter((section) => groups[section]?.length > 0)
      .map((section) => ({
        section,
        improvements: groups[section],
      }));
  }, [improvements]);

  // Get section display name
  const getSectionDisplayName = (section: LineImprovement["section"]) => {
    switch (section) {
      case "summary":
        return "Summary Statement";
      case "experience":
        return "Experience";
      case "education":
        return "Education";
      case "skills":
        return "Skills";
      case "other":
        return "Other";
    }
  };

  const handleApply = (improvementId: string) => {
    setAppliedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(improvementId)) {
        newSet.delete(improvementId);
      } else {
        newSet.add(improvementId);
      }
      return newSet;
    });
  };

  const handleCopyAll = async () => {
    const allSuggestions = improvements
      .map((imp) => `${imp.sectionTitle}:\n${imp.suggested}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(allSuggestions);
      toast.success("All suggestions copied!", {
        description: "Paste them into your resume editor",
      });
    } catch (error) {
      toast.error("Copy failed", {
        description: "Could not copy all suggestions",
      });
    }
  };

  // Calculate stats
  const totalImprovements = improvements.length;
  const appliedCount = appliedIds.size;
  const highPriorityCount = improvements.filter(
    (imp) => imp.priority === "high",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100/70 bg-indigo-50/40 px-5 py-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div>
            <span className="font-semibold text-slate-900">
              {totalImprovements}
            </span>
            <span className="ml-1 text-slate-600">
              {totalImprovements === 1 ? "improvement" : "improvements"}
            </span>
          </div>
          {highPriorityCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <div>
                <span className="font-semibold text-red-600">
                  {highPriorityCount}
                </span>
                <span className="ml-1 text-slate-600">high priority</span>
              </div>
            </>
          )}
          {appliedCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <div>
                <span className="font-semibold text-green-600">
                  {appliedCount}
                </span>
                <span className="ml-1 text-slate-600">applied</span>
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleCopyAll}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50"
          type="button"
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
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy All
        </button>
      </div>

      {/* Grouped Improvements by Section */}
      <Accordion
        className="space-y-3"
        defaultOpen={groupedImprovements[0]?.section}
        allowMultiple
      >
        {groupedImprovements.map(({ section, improvements: sectionImps }) => (
          <AccordionItem
            key={section}
            id={`improvements-${section}`}
            className="border-slate-200/60"
          >
            <AccordionHeader itemId={`improvements-${section}`}>
              <div className="flex w-full items-center justify-between gap-3">
                <span className="text-base font-semibold text-slate-900">
                  {getSectionDisplayName(section)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {sectionImps.length}{" "}
                    {sectionImps.length === 1 ? "tip" : "tips"}
                  </span>
                </div>
              </div>
            </AccordionHeader>
            <AccordionContent itemId={`improvements-${section}`}>
              <div className="space-y-4 pt-2">
                {sectionImps.map((improvement, index) => (
                  <DiffCard
                    key={`${section}-${index}`}
                    improvement={improvement}
                    onApply={handleApply}
                    isApplied={appliedIds.has(
                      improvement.sectionTitle + improvement.original,
                    )}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Help Text */}
      <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-5 py-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">How to use these tips</p>
        <p className="mt-1">
          Each suggestion shows the exact text to replace. Copy improvements one
          by one, or use "Copy All" to grab everything at once. Focus on high
          priority changes first for the biggest impact on your ATS score.
        </p>
      </div>
    </div>
  );
};

export default LineByLineImprovements;
