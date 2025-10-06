import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import Navbar from "~/components/Navbar";
import { CheckCheck, FileText, Lightbulb, NotebookPen } from "lucide-react";
import AnalysisSection from "~/components/AnalysisSection";
import LineByLineImprovements from "~/components/LineByLineImprovements";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "~/components/Accordion";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resumind | Review" },
  { name: "description", content: "Detailed review of your resume" },
];

const Resume = () => {
  const { id } = useParams();
  const { auth, isLoading, fs, kv } = usePuterStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [meta, setMeta] = useState<{
    companyName?: string;
    jobTitle?: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume) return;

      const data = JSON.parse(resume);
      setMeta({ companyName: data.companyName, jobTitle: data.jobTitle });

      const resumeBlob = await fs.read(data.resumePath);
      if (resumeBlob) {
        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
        const resumeObjectUrl = URL.createObjectURL(pdfBlob);
        setResumeUrl(resumeObjectUrl);
      }

      const imageBlob = await fs.read(data.imagePath);
      if (imageBlob) {
        const imageObjectUrl = URL.createObjectURL(imageBlob);
        setImageUrl(imageObjectUrl);
      }

      setFeedback(data.feedback);
    };

    loadResume();
  }, [id]);

  return (
    <main className="relative overflow-hidden">
      <Navbar />

      <section className="page-shell gap-12">
        <header className="flex flex-col gap-6">
          <Link to="/" className="back-button w-fit">
            <img src="/icons/back.svg" alt="Back" className="h-3 w-3" />
            <span>Back to dashboard</span>
          </Link>
          <div className="flex flex-col gap-2">
            <span className="section-eyebrow w-fit">Resume analysis</span>
            <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
              {meta?.jobTitle || "Latest submission"}
            </h1>
            <p className="text-base text-slate-600">
              {meta?.companyName
                ? `Tailored for ${meta.companyName}.`
                : "Add a company on your next upload to tailor advice."}
            </p>
          </div>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <aside className="preview-rail">
            <div className="surface-card surface-card--tight preview-rail__card">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
                  Live preview
                </p>
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 hover:text-indigo-700"
                  >
                    Open PDF
                  </a>
                )}
              </div>
              <div className="preview-rail__frame gradient-border overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    className="h-full w-full object-contain"
                    alt={`Resume preview for ${meta?.companyName || "this submission"}`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
                    Preview loading...
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500">
                The preview reflects the PDF uploaded to Puter. Download
                directly to review formatting before sending to recruiters.
              </p>
            </div>
          </aside>

          <section className="feedback-section lg:pl-0">
            {feedback ? (
              <div className="space-y-6">
                <div className="surface-card surface-card--tight">
                  <Summary feedback={feedback} />
                </div>

                <Accordion
                  className="space-y-5"
                  defaultOpen={["line-improvements"]}
                  allowMultiple
                  persistKey={`resume-${id}`}
                  showControls
                >
                  <AnalysisSection
                    id="ats"
                    icon={{ name: "fact_check", Icon: CheckCheck }}
                    title="ATS Readiness"
                    eyebrow="Parser score"
                    description="Stay above 80 to stay visible in recruiter dashboards."
                    badge={{
                      label: "Score",
                      value: feedback.ATS.score || 0,
                    }}
                  >
                    <ATS
                      score={feedback.ATS.score || 0}
                      suggestions={feedback.ATS.tips || []}
                    />
                  </AnalysisSection>

                  {feedback.lineImprovements &&
                    feedback.lineImprovements.length > 0 && (
                      <AnalysisSection
                        id="line-improvements"
                        icon={{ name: "stylus_note", Icon: NotebookPen }}
                        title="Line-by-Line Improvements"
                        eyebrow="Rewrite suggestions"
                        description="Drop in these replacements to boost clarity, impact, and keyword density."
                        badge={{
                          label: "Found",
                          value: feedback.lineImprovements.length,
                        }}
                      >
                        <LineByLineImprovements
                          improvements={feedback.lineImprovements}
                        />
                      </AnalysisSection>
                    )}

                  <AnalysisSection
                    id="detailed-coaching"
                    icon={{ name: "lightbulb", Icon: Lightbulb }}
                    title="Detailed Coaching"
                    eyebrow="Category breakdown"
                    description="Expand each section to review what is working well and the edits that will unlock the next score jump."
                    badge={{
                      label: "Sets",
                      value: 4,
                    }}
                  >
                    <Details feedback={feedback} />
                  </AnalysisSection>
                </Accordion>
              </div>
            ) : (
              <div className="surface-card surface-card--tight flex min-h-[420px] flex-col gap-6 text-center">
                <div className="flex flex-1 items-center justify-center overflow-hidden rounded-3xl bg-indigo-50/70 p-6">
                  <img
                    src="/images/resume-scan-2.gif"
                    alt="Loading"
                    className="h-full w-full max-h-[420px] object-contain"
                  />
                </div>
                <p className="mt-auto text-sm text-slate-600">
                  We are finishing up the analysis. This usually takes less than
                  a minute.
                </p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
};

export default Resume;
