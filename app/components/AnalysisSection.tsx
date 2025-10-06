import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { AccordionContent, AccordionHeader, AccordionItem } from "./Accordion";
import SectionHeader from "./SectionHeader";

interface AnalysisSectionProps {
  id: string;
  icon?: {
    name: string;
    Icon?: LucideIcon;
    tone?: "indigo" | "amber" | "emerald";
  };
  title: string;
  eyebrow?: string;
  description?: string;
  badge?: {
    label: string;
    value: number;
  };
  children: ReactNode;
  contentClassName?: string;
}

const AnalysisSection = ({
  id,
  icon,
  title,
  eyebrow,
  description,
  badge,
  children,
  contentClassName,
}: AnalysisSectionProps) => {
  return (
    <AccordionItem id={id}>
      <AccordionHeader
        itemId={id}
        className="border-b border-white/70 bg-white/75 backdrop-blur-lg"
      >
        <SectionHeader
          icon={icon}
          title={title}
          eyebrow={eyebrow}
          badge={badge}
          description={description}
        />
      </AccordionHeader>
      <AccordionContent
        itemId={id}
        className={cn("section-panel", contentClassName)}
      >
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default AnalysisSection;
