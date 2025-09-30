import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

interface AccordionContextType {
  activeItems: string[];
  toggleItem: (id: string) => void;
  isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = "",
}) => {
  const [activeItems, setActiveItems] = useState<string[]>(defaultOpen ? [defaultOpen] : []);

  const toggleItem = (id: string) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return prev.includes(id) ? [] : [id];
    });
  };

  const isItemActive = (id: string) => activeItems.includes(id);

  return (
    <AccordionContext.Provider value={{ activeItems, toggleItem, isItemActive }}>
      <div className={cn("space-y-3", className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ id, children, className = "" }) => {
  const { isItemActive } = useAccordion();
  const active = isItemActive(id);

  return (
    <div
      data-active={active}
      className={cn(
        "overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-[var(--shadow-ring)] transition-all duration-200",
        active ? "shadow-[0_22px_45px_-30px_rgba(99,102,241,0.35)]" : "",
        className,
      )}
    >
      {children}
    </div>
  );
};

interface AccordionHeaderProps {
  itemId: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right",
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  const contentId = `${itemId}-content`;
  const headerId = `${itemId}-header`;

  const defaultIcon = (
    <svg
      className={cn("h-4 w-4 transition-transform duration-200", { "rotate-180": isActive })}
      fill="none"
      stroke="#334155"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 9l6 6 6-6" />
    </svg>
  );

  return (
    <button
      type="button"
      id={headerId}
      onClick={() => toggleItem(itemId)}
      className={cn(
        "flex w-full items-center justify-between gap-4 px-6 py-4 text-left text-sm font-medium text-slate-700 hover:bg-slate-50/60",
        className,
      )}
      aria-expanded={isActive}
      aria-controls={contentId}
    >
      <div className="flex flex-1 items-center gap-3">
        {iconPosition === "left" && (icon || defaultIcon)}
        <div className="flex-1">{children}</div>
      </div>
      {iconPosition === "right" && (icon || defaultIcon)}
    </button>
  );
};

interface AccordionContentProps {
  itemId: string;
  children: ReactNode;
  className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  itemId,
  children,
  className = "",
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  const contentId = `${itemId}-content`;
  const headerId = `${itemId}-header`;

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={headerId}
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className={cn("overflow-hidden px-6 pb-6", className)}>{children}</div>
    </div>
  );
};
