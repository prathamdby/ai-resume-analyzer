import { prepareInstructions } from "../../constants";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { toast } from "sonner";

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
          description: imageFile.error || "Failed to process your PDF. Please try again.",
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
          setStatusText("We could not complete the analysis. Please try again.");
          toast.error("Analysis failed", {
            description: "The AI analysis could not be completed. Please try again.",
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
          setStatusText("Failed to process the analysis results.");
          toast.error("Processing failed", {
            description: "Could not parse the analysis results. Please try again.",
          });
          setIsProcessing(false);
          return;
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText("All done! Redirecting to your results...");
        navigate(`/resume/${uuid}`);
      } catch (aiError: any) {
        const errorMessage = getErrorMessage(aiError);

        // Detect Puter.js quota/usage errors
        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("limit") ||
          errorMessage.includes("usage") ||
          errorMessage.includes("exceeded")
        ) {
          setStatusText("Puter.js usage limit reached.");
          toast.error("Usage limit reached", {
            description: "Puter.js quota exceeded. Please try again later or contact support.",
          });
        } else if (
          errorMessage.includes("network") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("fetch")
        ) {
          setStatusText("Connection issue. Please check your internet.");
          toast.error("Connection error", {
            description: "Network issue detected. Check your internet and try again.",
          });
        } else {
          setStatusText("Analysis failed. Please try again.");
          toast.error("Analysis failed", {
            description: errorMessage || "An unexpected error occurred during analysis.",
          });
        }

        setIsProcessing(false);
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);

      setStatusText("Something went wrong. Please try again.");
      toast.error("Unexpected error", {
        description: errorMessage || "An unexpected error occurred. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing || !file) return;

    const formData = new FormData(e.currentTarget);
    const companyName = (formData.get("company-name") as string) || "";
    const jobTitle = (formData.get("job-title") as string) || "";
    const jobDescription = (formData.get("job-description") as string) || "";

    if (!jobTitle.trim() || !jobDescription.trim()) {
      setStatusText(
        "Add a job title and description so the feedback is personalized.",
      );
      return;
    }

    handleAnalyze({
      companyName,
      jobTitle,
      jobDescription,
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
            <div className="form-panel__grid">
              <div className="input-wrapper">
                <label htmlFor="company-name" className="input-label">
                  Company name
                </label>
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  placeholder="e.g. Aurora Labs"
                  className="input-field"
                  disabled={isProcessing}
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="job-title" className="input-label required">
                  Job title
                </label>
                <input
                  type="text"
                  name="job-title"
                  id="job-title"
                  placeholder="e.g. Senior Product Designer"
                  className="input-field"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="input-wrapper">
              <label htmlFor="job-description" className="input-label required">
                Job description
              </label>
              <textarea
                rows={6}
                name="job-description"
                id="job-description"
                placeholder="Paste the most important responsibilities and requirements"
                className="textarea-field"
                required
                disabled={isProcessing}
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
    </main>
  );
};

export default Upload;
