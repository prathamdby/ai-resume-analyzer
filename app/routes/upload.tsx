import { prepareInstructions } from "../../constants";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import ImportFromSiteModal from "~/components/ImportFromSiteModal";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { cn, generateUUID } from "~/lib/utils";
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
  const [touched, setTouched] = useState({
    jobTitle: false,
    jobDescription: false,
    file: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    jobTitle: "",
    jobDescription: "",
    file: "",
  });

  const extractMessageText = (content: unknown): string => {
    if (!content) return "";

    if (typeof content === "string") {
      return content.trim();
    }

    if (Array.isArray(content)) {
      const parts: string[] = [];

      for (const item of content) {
        if (!item) continue;

        if (typeof item === "string") {
          parts.push(item);
          continue;
        }

        if (
          typeof item === "object" &&
          "text" in item &&
          typeof (item as { text?: unknown }).text === "string"
        ) {
          parts.push(((item as { text?: string }).text as string) || "");
        }
      }

      return parts.join("").trim();
    }

    if (
      typeof content === "object" &&
      "text" in (content as { text?: unknown }) &&
      typeof (content as { text?: unknown }).text === "string"
    ) {
      return ((content as { text?: string }).text as string).trim();
    }

    return "";
  };

  const normalizeExtractedField = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";

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

  const validateFeedbackStructure = (data: unknown): data is Feedback => {
    if (!data || typeof data !== "object") return false;

    const feedback = data as any;

    const validateTips = (
      tips: unknown,
      { requireExplanation }: { requireExplanation: boolean },
    ): boolean => {
      if (!Array.isArray(tips)) return false;

      for (const tip of tips) {
        if (!tip || typeof tip !== "object") return false;

        const tipEntry = tip as {
          type?: unknown;
          tip?: unknown;
          explanation?: unknown;
        };

        if (tipEntry.type !== "good" && tipEntry.type !== "improve")
          return false;
        if (typeof tipEntry.tip !== "string" || !tipEntry.tip.trim())
          return false;

        if (requireExplanation) {
          if (
            typeof tipEntry.explanation !== "string" ||
            !tipEntry.explanation.trim()
          ) {
            return false;
          }
        }
      }

      return true;
    };

    const validateLineImprovements = (value: unknown): boolean => {
      if (value === undefined) return true;
      if (!Array.isArray(value)) return false;

      for (const improvement of value) {
        if (!improvement || typeof improvement !== "object") return false;
        const entry = improvement as LineImprovement;

        if (
          !entry.section ||
          !entry.sectionTitle ||
          !entry.original ||
          !entry.suggested ||
          !entry.reason ||
          !entry.priority ||
          !entry.category
        ) {
          return false;
        }
      }

      return true;
    };

    // Check required top-level fields
    if (typeof feedback.overallScore !== "number") return false;

    // Validate ATS tips
    if (
      !feedback.ATS ||
      typeof feedback.ATS !== "object" ||
      typeof feedback.ATS.score !== "number" ||
      !validateTips(feedback.ATS.tips, { requireExplanation: false })
    ) {
      return false;
    }

    const sectionsRequiringExplanation = [
      "toneAndStyle",
      "content",
      "structure",
      "skills",
    ];

    for (const section of sectionsRequiringExplanation) {
      const sectionData = feedback[section];
      if (
        !sectionData ||
        typeof sectionData !== "object" ||
        typeof sectionData.score !== "number" ||
        !validateTips(sectionData.tips, { requireExplanation: true })
      ) {
        return false;
      }
    }

    if (!validateLineImprovements(feedback.lineImprovements)) {
      return false;
    }

    return true;
  };

  const validateJobTitle = (value: string): string => {
    if (!value.trim()) return "Job title is required";
    return "";
  };

  const validateJobDescription = (value: string): string => {
    if (!value.trim()) return "Job description is required";
    if (value.trim().length < 50) return "At least 50 characters needed";
    return "";
  };

  const validateFile = (fileToValidate: File | null): string => {
    if (!fileToValidate) return "Resume PDF is required";
    if (fileToValidate.type !== "application/pdf")
      return "Only PDF files accepted";
    if (fileToValidate.size === 0) return "File appears to be empty";
    if (fileToValidate.size > 20 * 1024 * 1024)
      return "File must be under 20 MB";
    return "";
  };

  const handleFileSelect = (newFile: File | null) => {
    if (isProcessing) return;
    setFile(newFile);
    setTouched((prev) => ({ ...prev, file: true }));

    if (!newFile) {
      setFieldErrors((prev) => ({
        ...prev,
        file: validateFile(null),
      }));
      setStatusText("Upload your resume to begin");
      return;
    }

    const error = validateFile(newFile);
    setFieldErrors((prev) => ({ ...prev, file: error }));

    if (error) {
      setStatusText(error);
      return;
    }

    setStatusText("Resume uploaded. Ready when you are.");
  };

  const fetchPageContent = async (rawUrl: string): Promise<string> => {
    let targetUrl: URL;

    try {
      targetUrl = new URL(rawUrl);
    } catch (urlError) {
      throw new Error("Please enter a valid job posting URL.");
    }

    const fetchTargets: string[] = [targetUrl.toString()];

    const jinaPrefix =
      targetUrl.protocol === "https:"
        ? "https://r.jina.ai/https://"
        : "https://r.jina.ai/http://";
    fetchTargets.push(
      `${jinaPrefix}${targetUrl.host}${targetUrl.pathname}${targetUrl.search}`,
    );

    let lastError: Error | null = null;

    for (const attemptUrl of fetchTargets) {
      try {
        const response = await fetch(attemptUrl, {
          headers: {
            "User-Agent": "ResumindJobFetcher/1.0",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        if (!response.ok) {
          lastError = new Error(
            `Failed to fetch: ${response.status} ${response.statusText}`,
          );
          continue;
        }

        const html = await response.text();
        if (!html) {
          lastError = new Error("The response did not contain any content.");
          continue;
        }

        if (typeof window === "undefined" || typeof DOMParser === "undefined") {
          lastError = new Error(
            "Job importing is only available in the browser.",
          );
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
          return cleaned.length > maxLength
            ? cleaned.slice(0, maxLength)
            : cleaned;
        }

        lastError = new Error("The page did not contain readable content.");
      } catch (attemptError) {
        lastError =
          attemptError instanceof Error
            ? attemptError
            : new Error(
                "Failed to fetch the job posting due to a network error.",
              );
      }
    }

    throw (
      lastError ||
      new Error(
        "Unable to fetch the job posting. Please copy and paste the job details manually.",
      )
    );
  };

  const handleImportFromSite = async (url: string) => {
    setIsImporting(true);
    const maxRetries = 3;

    try {
      // Validate AI availability first
      if (!ai || typeof ai.chat !== "function") {
        throw new Error("AI service is not ready yet");
      }

      // Fetch the page content
      const pageContent = await fetchPageContent(url);

      if (!pageContent) {
        throw new Error("No content found at the provided URL");
      }

      // Use Puter AI to extract job details with retry logic
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

      let extracted: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
      } | null = null;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await ai.chat(prompt, {
            model: "gemini-2.0-flash",
            temperature: 0,
          });

          if (!response || !response.message || !response.message.content) {
            lastError = new Error("AI service did not return a valid response");
            continue;
          }

          const content = extractMessageText(response.message.content);

          if (!content) {
            lastError = new Error("AI response content is empty");
            continue;
          }

          // Parse the JSON response with guard
          let parsed: unknown;
          try {
            parsed = JSON.parse(content);

            if (parsed && typeof parsed === "object") {
              const candidate = parsed as {
                companyName?: unknown;
                jobTitle?: unknown;
                jobDescription?: unknown;
              };

              const normalizedCompany = normalizeExtractedField(
                candidate.companyName,
              );
              const normalizedJobTitle = normalizeExtractedField(
                candidate.jobTitle,
              );
              const normalizedJobDescription = normalizeExtractedField(
                candidate.jobDescription,
              );

              const allFieldsPresent =
                normalizedCompany.length > 0 &&
                normalizedJobTitle.length > 0 &&
                normalizedJobDescription.length > 0;

              if (allFieldsPresent) {
                extracted = {
                  companyName: normalizedCompany,
                  jobTitle: normalizedJobTitle,
                  jobDescription: normalizedJobDescription,
                };
                break;
              } else {
                lastError = new Error(
                  "Extracted data missing required job details",
                );
              }
            } else {
              lastError = new Error("AI response is not a valid object");
            }
          } catch (parseError) {
            lastError = new Error(
              `Failed to parse AI response as JSON: ${
                parseError instanceof Error
                  ? parseError.message
                  : "Unknown error"
              }`,
            );
          }
        } catch (aiError) {
          lastError =
            aiError instanceof Error ? aiError : new Error("AI request failed");
        }
      }

      if (!extracted) {
        throw (
          lastError ||
          new Error("Failed to extract job details after multiple attempts")
        );
      }

      // Autofill the form fields
      setCompanyName(extracted.companyName);
      setJobTitle(extracted.jobTitle);
      setJobDescription(extracted.jobDescription);

      toast.success("Job details imported", {
        description: "The form has been filled with the extracted information.",
      });

      setImportModalOpen(false);
    } catch (error) {
      console.error("Import error:", error);

      let toastDescription =
        "We couldn't import the job details. Please paste them manually.";

      if (error instanceof Error) {
        // Handle specific error types
        if (error.message === "Please enter a valid job posting URL.") {
          toastDescription = error.message;
        } else if (error.message.startsWith("Unable to fetch")) {
          toastDescription = error.message;
        } else if (error.message === "AI service is not ready yet") {
          toastDescription =
            "The AI service is not ready yet. Please try again in a moment.";
        } else if (
          error.message.includes("AI service") ||
          error.message.includes("AI response")
        ) {
          toastDescription =
            "Failed to extract job details using AI. Please paste them manually.";
        } else if (
          error.message.includes("parse") ||
          error.message.includes("JSON")
        ) {
          toastDescription =
            "Failed to process the extracted data. Please paste the details manually.";
        }
      }

      toast.error("Import failed", {
        description: toastDescription,
      });
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
      const data: Omit<Resume, "feedback"> & { feedback: Feedback | "" } = {
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

      if (!ai || typeof ai.feedback !== "function") {
        setStatusText(
          "AI analysis is currently unavailable. Please try again.",
        );
        toast.error("Analysis unavailable", {
          description:
            "The AI service is not ready yet. Please try again in a moment.",
        });
        setIsProcessing(false);
        return;
      }

      let feedback;
      try {
        feedback = await ai.feedback(
          uploadedFile.path,
          prepareInstructions({
            jobTitle,
            jobDescription,
          }),
        );

        if (!feedback) {
          throw new Error("AI service did not return a response");
        }

        if (!feedback.message || !feedback.message.content) {
          throw new Error("AI response is missing content");
        }
      } catch (aiError: any) {
        const errorDetails = getErrorMessage(aiError);
        console.error("AI analysis error:", aiError);

        setStatusText("AI analysis failed. Please try again.");
        toast.error("Analysis failed", {
          description: errorDetails.includes("AI service")
            ? "The AI service is currently unavailable. Please try again in a moment."
            : "Failed to analyze your resume. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      const feedbackText = extractMessageText(feedback.message.content);

      if (!feedbackText) {
        setStatusText("AI response was empty. Please try again.");
        toast.error("Processing failed", {
          description: "AI response was empty. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      // Parse and validate the JSON response
      let parsedFeedback: unknown;
      try {
        parsedFeedback = JSON.parse(feedbackText);
      } catch (parseError) {
        const errorDetails =
          parseError instanceof Error
            ? parseError.message
            : "Unknown parsing error";

        setStatusText("Please try again later!");
        toast.error("Processing failed", {
          description: "Could not process AI feedback. Please try again later!",
        });
        setIsProcessing(false);
        return;
      }

      // Validate the structure matches the Feedback interface
      if (!validateFeedbackStructure(parsedFeedback)) {
        console.error("AI feedback structure validation failed");
        console.error("Received structure:", parsedFeedback);

        setStatusText("AI returned incomplete analysis. Please try again.");
        toast.error("Processing failed", {
          description:
            "The analysis result is incomplete or malformed. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      // At this point, TypeScript knows parsedFeedback is a valid Feedback
      data.feedback = parsedFeedback;

      try {
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
      } catch (kvSaveError) {
        console.error("Failed to save feedback to KV:", kvSaveError);
        setStatusText("Failed to save analysis. Please try again.");
        toast.error("Storage failed", {
          description: "Could not save your analysis. Please try again.",
        });
        setIsProcessing(false);
        return;
      }

      setStatusText("All done! Redirecting to your results...");
      navigate(`/resume/${uuid}`);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      console.error("Upload workflow error:", error);

      let statusMessage = "Something went wrong. Please try again.";
      let toastDescription =
        errorMessage || "An unexpected error occurred. Please try again.";

      if (errorMessage.includes("Puter.js not available")) {
        statusMessage =
          "Puter services are unavailable. Please refresh and try again.";
        toastDescription =
          "We could not reach Puter services. Please refresh the page or try again shortly.";
      } else if (errorMessage.includes("Failed to check auth status")) {
        statusMessage = "Authentication issue detected. Please sign in again.";
        toastDescription =
          "We could not verify your Puter session. Please sign in again and retry.";
      } else if (
        errorMessage.includes("upload") ||
        errorMessage.includes("Upload")
      ) {
        statusMessage = "Resume upload failed. Please try again.";
        toastDescription = errorMessage;
      }

      setStatusText(statusMessage);
      toast.error("Unexpected error", {
        description: toastDescription,
      });
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProcessing) return;

    // Mark all fields as touched
    setTouched({
      jobTitle: true,
      jobDescription: true,
      file: true,
    });

    // Validate all fields
    const jobTitleError = validateJobTitle(jobTitle);
    const jobDescriptionError = validateJobDescription(jobDescription);
    const fileError = validateFile(file);

    setFieldErrors({
      jobTitle: jobTitleError,
      jobDescription: jobDescriptionError,
      file: fileError,
    });

    // Check for any errors
    if (jobTitleError || jobDescriptionError || fileError) {
      if (jobTitleError) {
        toast.error("Job title required", {
          description: jobTitleError,
        });
        return;
      }

      if (jobDescriptionError) {
        toast.error("Job description issue", {
          description: jobDescriptionError,
        });
        return;
      }

      if (fileError) {
        toast.error("Resume file issue", {
          description: fileError,
        });
        return;
      }
    }

    handleAnalyze({
      companyName: companyName.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      file: file!,
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
                className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-600 transition-all hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    if (touched.jobTitle) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        jobTitle: validateJobTitle(e.target.value),
                      }));
                    }
                  }}
                  onBlur={(event) => {
                    setTouched((prev) => ({ ...prev, jobTitle: true }));
                    setFieldErrors((prev) => ({
                      ...prev,
                      jobTitle: validateJobTitle(event.target.value),
                    }));
                  }}
                  placeholder="e.g. Senior Product Designer"
                  className={cn(
                    "input-field",
                    touched.jobTitle &&
                      fieldErrors.jobTitle &&
                      "!border-red-300 !bg-red-50/30",
                    touched.jobTitle &&
                      !fieldErrors.jobTitle &&
                      "!border-green-300 !bg-green-50/20",
                  )}
                  aria-invalid={
                    touched.jobTitle && Boolean(fieldErrors.jobTitle)
                  }
                  aria-describedby={
                    touched.jobTitle && fieldErrors.jobTitle
                      ? "job-title-error"
                      : undefined
                  }
                  required
                  disabled={isProcessing || isImporting}
                />
                {touched.jobTitle && fieldErrors.jobTitle && (
                  <p
                    id="job-title-error"
                    className="text-sm font-medium text-red-600"
                    role="alert"
                  >
                    {fieldErrors.jobTitle}
                  </p>
                )}
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
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (touched.jobDescription) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      jobDescription: validateJobDescription(e.target.value),
                    }));
                  }
                }}
                onBlur={(event) => {
                  setTouched((prev) => ({ ...prev, jobDescription: true }));
                  setFieldErrors((prev) => ({
                    ...prev,
                    jobDescription: validateJobDescription(event.target.value),
                  }));
                }}
                placeholder="Paste the most important responsibilities and requirements"
                className={cn(
                  "textarea-field",
                  touched.jobDescription &&
                    fieldErrors.jobDescription &&
                    "!border-red-300 !bg-red-50/30",
                  touched.jobDescription &&
                    !fieldErrors.jobDescription &&
                    jobDescription.trim().length >= 50 &&
                    "!border-green-300 !bg-green-50/20",
                )}
                aria-invalid={
                  touched.jobDescription && Boolean(fieldErrors.jobDescription)
                }
                aria-describedby={
                  touched.jobDescription && fieldErrors.jobDescription
                    ? "job-description-error"
                    : undefined
                }
                required
                disabled={isProcessing || isImporting}
              />
              {touched.jobDescription && fieldErrors.jobDescription && (
                <p
                  id="job-description-error"
                  className="text-sm font-medium text-red-600"
                  role="alert"
                >
                  {fieldErrors.jobDescription}
                </p>
              )}
              {touched.jobDescription &&
                !fieldErrors.jobDescription &&
                jobDescription.trim().length >= 50 && (
                  <p className="text-sm font-medium text-green-600">
                    ✓ Looks good! ({jobDescription.trim().length} characters)
                  </p>
                )}
            </div>

            <div className="input-wrapper">
              <label className="input-label required" htmlFor="resume-upload">
                Resume PDF
              </label>
              <FileUploader
                onFileSelect={handleFileSelect}
                onErrorChange={(message) => {
                  setFieldErrors((prev) => ({ ...prev, file: message }));
                }}
                error={touched.file ? fieldErrors.file : ""}
                disabled={isProcessing || isImporting}
                inputId="resume-upload"
              />
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
