import { prepareInstructions } from "../../constants";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import ImportFromSiteModal from "~/components/ImportFromSiteModal";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { toast } from "sonner";
import { Globe } from "lucide-react";

const checklist = [
  {
    title: "Tailor to the role",
    description:
      "Share the job title and paste the job description to unlock targeted advice.",
  },
  {
    title: "Upload a clean PDF",
    description:
      "Use a single-column layout with clear headings for the best ATS results.",
  },
  {
    title: "Iterate quickly",
    description:
      "Re-run analyses after updates to track progress and lift your score.",
  },
];

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("Upload your resume to begin");
  const [file, setFile] = useState<File | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const getErrorMessage = (error: any): string => {
    if (!error) return "An unknown error occurred";
    if (typeof error === "string") return error;
    if (error.message) return error.message;
    if (error.error) return String(error.error);
    try {
      return JSON.stringify(error);
    } catch {
      return "An unexpected error occurred";
    }
  };

  const handleFileSelect = (newFile: File | null) => {
    if (isProcessing) return;
    setFile(newFile);
  };

  const fetchPageContent = async (rawUrl: string): Promise<string> => {
    let targetUrl: URL;

    try {
      targetUrl = new URL(rawUrl);
    } catch (urlError) {
      throw new Error("Please enter a valid job posting URL.");
    }

    const fetchTargets: string[] = [targetUrl.toString()];

    const jinaPrefix = targetUrl.protocol === "https:" ? "https://r.jina.ai/https://" : "https://r.jina.ai/http://";
    fetchTargets.push(
      `${jinaPrefix}${targetUrl.host}${targetUrl.pathname}${targetUrl.search}`,
    );

    let lastError: Error | null = null;

    for (const attemptUrl of fetchTargets) {
      try {
        const response = await fetch(attemptUrl, {
          headers: {
            "User-Agent": "ResumindJobFetcher/1.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        if (!response.ok) {
          lastError = new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          continue;
        }

        const html = await response.text();
        if (!html) {
          lastError = new Error("The response did not contain any content.");
          continue;
        }

        if (typeof window === "undefined" || typeof DOMParser === "undefined") {
          lastError = new Error("Job importing is only available in the browser.");
          continue;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        if (!doc?.body) {
          lastError = new Error("Could not parse the job posting HTML.");
          continue;
        }

        const elementsToRemove = doc.querySelectorAll(
          "script, style, noscript, iframe, svg, canvas, header nav, footer, aside",
        );
        elementsToRemove.forEach((el) => el.remove());

        const textContent = doc.body.innerText || doc.body.textContent || "";
        const cleaned = textContent
          .replace(/\u00a0/g, " ")
          .replace(/\s+\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        if (cleaned.length > 0) {
          const maxLength = 20000;
          return cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
        }

        lastError = new Error("The page did not contain readable content.");
      } catch (attemptError) {
        lastError = attemptError instanceof Error
          ? attemptError
          : new Error("Failed to fetch the job posting due to a network error.");
      }
    }

    throw lastError || new Error("Unable to fetch the job posting. Please copy and paste the job details manually.");
  };

  const handleImportFromSite = async (url: string) => {
    setIsImporting(true);
    
    try {
      // Fetch the page content
      const pageContent = await fetchPageContent(url);
      
      if (!pageContent) {
        throw new Error("No content found at the provided URL");
      }

      // Use Puter AI to extract job details
      const prompt = `You are a job posting parser. Extract the following information from the provided job posting content and return ONLY a valid JSON object with these exact fields:
{
  "companyName": "the company name",
  "jobTitle": "the job title/position",
  "jobDescription": "the full job description including responsibilities and requirements"
}

If any field cannot be determined, use an empty string for that field.
Return ONLY the JSON object, no additional text or explanation.

Job Posting Content:
${pageContent.slice(0, 8000)}`; // Limit content to avoid token limits

      const response = await ai.chat(prompt, {
        model: "claude-3-7-sonnet",
        temperature: 0,
      });

      if (!response || !response.message || !response.message.content) {
        throw new Error("Failed to extract job details from the AI response");
      }

      const content =
        typeof response.message.content === "string"
          ? response.message.content
          : response.message.content[0]?.text || "";

      // Parse the JSON response
      const extracted = JSON.parse(content.trim());

      // Autofill the form fields
      if (extracted.companyName) setCompanyName(extracted.companyName);
      if (extracted.jobTitle) setJobTitle(extracted.jobTitle);
      if (extracted.jobDescription) setJobDescription(extracted.jobDescription);

      toast.success("Job details imported", {
        description: "The form has been filled with the extracted information.",
      });

      setImportModalOpen(false);
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading your resume...");

    try {
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        setStatusText("We could not upload your file. Please try again.");
        toast.error("Upload failed", {
          description: "Failed to upload your resume. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      setStatusText("Preparing your resume for analysis...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        const errorMsg = imageFile.error
          ? `We had trouble processing your resume: ${imageFile.error}`
          : "We had trouble processing your resume. Please try again.";
        setStatusText(errorMsg);
        toast.error("Processing failed", {
          description:
            imageFile.error || "Failed to process your PDF. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      setStatusText("Generating preview...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) {
        setStatusText("Something went wrong. Please try uploading again.");
        toast.error("Upload failed", {
          description: "Failed to upload the preview image. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };

      try {
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
      } catch (kvError) {
        setStatusText("Failed to save resume data. Please try again.");
        toast.error("Storage failed", {
          description: "Could not save your resume data. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      setStatusText("Analyzing your resume...");

      try {
        const feedback = await ai.feedback(
          uploadedFile.path,
          prepareInstructions({
            jobTitle,
            jobDescription,
          }),
        );

        if (!feedback) {
          setStatusText("Please try again later!");
          toast.error("Analysis failed", {
            description: "Please try again later!",
          });
          setIsProcessing(false);
          return;
        }

        const feedbackText =
          typeof feedback.message.content === "string"
            ? feedback.message.content
            : feedback.message.content[0].text;

        try {
          data.feedback = JSON.parse(feedbackText);
        } catch (parseError) {
          setStatusText("Please try again later!");
          toast.error("Processing failed", {
            description: "Please try again later!",
          });
          setIsProcessing(false);
          return;
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText("All done! Redirecting to your results...");
        navigate(`/resume/${uuid}`);
      } catch (aiError: any) {
        setStatusText("Please try again later!");
        toast.error("Analysis failed", {
          description: "Please try again later!",
        });
        setIsProcessing(false);
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);

      setStatusText("Something went wrong. Please try again.");
      toast.error("Unexpected error", {
        description:
          errorMessage || "An unexpected error occurred. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing || !file) return;

    const trimmedJobTitle = jobTitle.trim();
    const trimmedJobDescription = jobDescription.trim();

    if (!trimmedJobTitle || !trimmedJobDescription) {
      setStatusText(
        "Add a job title and description so the feedback is personalized.",
      );
      return;
    }

    handleAnalyze({
      companyName: companyName.trim(),
      jobTitle: trimmedJobTitle,
      jobDescription: trimmedJobDescription,
      file,
    });
  };

  return (
    <main className="relative overflow-hidden">
      <div className="hero-decor" aria-hidden="true" />
      <Navbar />

      <section className="page-shell gap-16">
        <header className="flex flex-col gap-6 max-w-3xl">
          <span className="section-eyebrow">Upload & analyze</span>
          <h1 className="headline">
            Get personalized feedback for your dream job
          </h1>
          <p className="subheadline">
            Provide the role you are targeting and we will return ATS-aligned
            coaching, actionable next steps, and a visual preview in seconds.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <form
            id="upload-form"
            onSubmit={handleSubmit}
            className="form-panel surface-card surface-card--tight"
            aria-describedby="upload-status"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Job details
              </h2>
              <button
                type="button"
                onClick={() => setImportModalOpen(true)}
                disabled={isProcessing || isImporting}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Globe className="h-4 w-4" />
                Import from site
              </button>
            </div>

            <div className="form-panel__grid">
              <div className="input-wrapper">
                <label htmlFor="company-name" className="input-label">
                  Company name
                </label>
                <input
                  type="text"
                  id="company-name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Aurora Labs"
                  className="input-field"
                  disabled={isProcessing || isImporting}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="job-title" className="input-label required">
                  Job title
                </label>
                <input
                  type="text"
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className="input-field"
                  required
                  disabled={isProcessing || isImporting}
                />
              </div>
            </div>

            <div className="input-wrapper">
              <label htmlFor="job-description" className="input-label required">
                Job description
              </label>
              <textarea
                rows={6}
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the most important responsibilities and requirements"
                className="textarea-field"
                required
                disabled={isProcessing || isImporting}
              />
            </div>

            <div className="input-wrapper">
              <label className="input-label required" htmlFor="resume-upload">
                Resume PDF
              </label>
              <FileUploader onFileSelect={handleFileSelect} />
              <p className="text-xs text-slate-500">
                We store your file securely in your Puter drive so you can
                revisit the analysis later.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                className="primary-button"
                type="submit"
                disabled={isProcessing || !file}
              >
                {isProcessing ? "Analyzing..." : "Analyze resume"}
              </button>
              <span className="text-xs text-slate-500">
                {file ? "Ready to analyze" : "Select a PDF to enable analysis"}
              </span>
            </div>
          </form>

          <aside
            className="surface-card surface-card--tight flex h-full min-h-[420px] flex-col gap-6"
            aria-live="polite"
          >
            <div className="flex flex-1 flex-col">
              {isProcessing ? (
                <div className="flex flex-1 flex-col gap-4 text-center">
                  <div className="flex flex-1 items-center justify-center overflow-hidden rounded-3xl bg-indigo-50/70 p-6">
                    <img
                      src="/images/resume-scan.gif"
                      alt="Analyzing resume"
                      className="h-full w-full max-h-[420px] object-contain"
                    />
                  </div>
                  <p className="text-sm text-slate-600">
                    Keep this tab open. We will redirect you once the analysis
                    is complete.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-sm text-slate-600">
                  <h2 className="text-base font-semibold text-slate-900">
                    Before you upload
                  </h2>
                  <ul className="space-y-3">
                    {checklist.map((item) => (
                      <li
                        key={item.title}
                        className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3"
                      >
                        <p className="font-semibold text-slate-800">
                          {item.title}
                        </p>
                        <p>{item.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <p
              id="upload-status"
              className="mt-auto text-sm font-semibold text-indigo-600 text-center"
            >
              {statusText}
            </p>
          </aside>
        </div>
      </section>

      <ImportFromSiteModal
        isOpen={importModalOpen}
        onCancel={() => {
          if (isImporting) return;
          setImportModalOpen(false);
        }}
        onImport={handleImportFromSite}
      />
    </main>
  );
};

export default Upload;
