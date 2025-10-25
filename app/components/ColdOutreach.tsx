import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const ColdOutreach = ({ message }: { message: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Copied to clipboard", {
        description: "The message is ready to paste into LinkedIn.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy", {
        description: "Please try selecting and copying the text manually.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="group relative">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-white p-6">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {message}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 shadow-sm transition-all duration-150 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus-visible:opacity-100"
          type="button"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-5 py-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Tip</p>
        <p className="mt-1">
          Before sending, add a line referencing a recent company announcement,
          project, or something specific from the hiring manager's profile to
          stand out even more.
        </p>
      </div>
    </div>
  );
};

export default ColdOutreach;
