import { useState } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
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
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-900">
          Ready-to-Send LinkedIn Message
        </h3>
        <p className="text-sm text-slate-600">
          Copy this personalized message to reach out directly to the hiring
          manager or recruiter. Make any adjustments you need before sending.
        </p>
      </div>

      <div className="relative">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50/50 to-white p-5">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {message}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md"
          type="button"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="space-y-1 text-sm text-slate-700">
            <p className="font-semibold">Personalization tip</p>
            <p>
              Before sending, add a line referencing a recent company
              announcement, project, or something specific from the hiring
              manager's profile to stand out even more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColdOutreach;
