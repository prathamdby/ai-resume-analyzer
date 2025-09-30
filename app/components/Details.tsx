import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "./Accordion";
import ScoreBadge from "./ScoreBadge";

const CategoryHeader = ({ title, categoryScore }: { title: string; categoryScore: number }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold text-slate-900">{title}</span>
        <ScoreBadge score={categoryScore} size="sm" showScore={false} />
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {categoryScore}/100
      </span>
    </div>
  );
};

const CategoryContent = ({
  tips,
}: {
  tips: { type: "good" | "improve"; tip: string; explanation: string }[];
}) => {
  if (!tips || tips.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        No recommendations were generated for this category yet. Re-run the analysis to refresh the
        guidance.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-3 sm:grid-cols-2">
        {tips.map((tip, index) => (
          <li
            key={`summary-${index}-${tip.tip}`}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/90 px-4 py-3"
          >
            <span
              className={cn(
                "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
                tip.type === "good" ? "bg-green-100" : "bg-amber-100",
              )}
            >
              <img
                src={tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg"}
                alt={tip.type === "good" ? "Positive insight" : "Improvement suggested"}
                className="h-5 w-5"
              />
            </span>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">{tip.tip}</p>
              <p>{tip.explanation}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Details = ({ feedback }: { feedback: Feedback }) => {
  return (
    <section className="section-panel surface-card">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Detailed coaching</h2>
        <p className="text-sm text-slate-600">
          Expand each section to review what is working well and the edits that will unlock the next
          score jump.
        </p>
      </div>
      <Accordion className="space-y-3" defaultOpen="tone-style" allowMultiple>
        <AccordionItem id="tone-style">
          <AccordionHeader itemId="tone-style">
            <CategoryHeader title="Tone & Style" categoryScore={feedback.toneAndStyle.score} />
          </AccordionHeader>
          <AccordionContent itemId="tone-style">
            <CategoryContent tips={feedback.toneAndStyle.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="content">
          <AccordionHeader itemId="content">
            <CategoryHeader title="Content" categoryScore={feedback.content.score} />
          </AccordionHeader>
          <AccordionContent itemId="content">
            <CategoryContent tips={feedback.content.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="structure">
          <AccordionHeader itemId="structure">
            <CategoryHeader title="Structure" categoryScore={feedback.structure.score} />
          </AccordionHeader>
          <AccordionContent itemId="structure">
            <CategoryContent tips={feedback.structure.tips} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem id="skills">
          <AccordionHeader itemId="skills">
            <CategoryHeader title="Skills" categoryScore={feedback.skills.score} />
          </AccordionHeader>
          <AccordionContent itemId="skills">
            <CategoryContent tips={feedback.skills.tips} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

export default Details;


