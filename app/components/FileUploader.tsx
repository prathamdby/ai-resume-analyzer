import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { cn, formatSize } from "~/lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
  onErrorChange?: (message: string) => void;
  error?: string;
  disabled?: boolean;
  inputId?: string;
}

const FileUploader = ({
  onFileSelect,
  onErrorChange,
  error,
  disabled,
  inputId,
}: FileUploaderProps) => {
  const maxFileSize = 20 * 1024 * 1024;

  const handleRejection = useCallback((rejectedFiles: FileRejection[]) => {
    const rejection = rejectedFiles[0];
    const rejectionError = rejection?.errors?.[0];

    let message = rejectionError?.message || "Please upload a valid PDF file.";

    if (rejectionError?.code === "file-too-large") {
      message = "Please upload a PDF smaller than 20 MB.";
      toast.error("File too large", {
        description: message,
      });
    } else if (rejectionError?.code === "file-invalid-type") {
      message = "Only PDF files are supported. Please upload a PDF resume.";
      toast.error("Invalid file type", {
        description: message,
      });
    } else {
      toast.error("Upload error", {
        description: message,
      });
    }

    onErrorChange?.(message);
    onFileSelect?.(null);
  }, [onErrorChange, onFileSelect]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (disabled) return;

      if (rejectedFiles.length > 0) {
        handleRejection(rejectedFiles);
        return;
      }

      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
      onErrorChange?.("");
    },
    [disabled, handleRejection, onErrorChange, onFileSelect],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
    fileRejections,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
    maxSize: maxFileSize,
    disabled,
  });

  const file = acceptedFiles[0] || null;
  const rejection = fileRejections[0];

  const hasError = Boolean(error);

  const helperId = inputId ? `${inputId}-error` : undefined;

  return (
    <div
      className="uploader surface-card surface-card--tight"
      role="group"
      aria-label="Resume upload"
    >
      <div
        {...getRootProps({
          className: cn(
            "uploader-dropzone",
            isDragActive && "border-indigo-300 bg-indigo-50/60",
            hasError && !file && "border-red-300 bg-red-50/30",
            disabled && "cursor-not-allowed opacity-60",
          ),
        })}
      >
        <input
          {...getInputProps({
            "aria-label": "Upload resume PDF",
            id: inputId,
            "aria-invalid": hasError,
            "aria-describedby": hasError && helperId ? helperId : undefined,
          })}
        />

        {!file && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="uploader-dropzone__icon">
              <img src="/icons/info.svg" alt="Upload" className="h-10 w-10" />
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <p className="text-base font-semibold text-slate-700">
                {isDragActive
                  ? "Drop your resume"
                  : "Click to upload or drag and drop"}
              </p>
              <p>PDF only, up to {formatSize(maxFileSize)}</p>
            </div>
          </div>
        )}

        {file && (
          <div
            className="uploader-selected-file"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <img src="/images/pdf.png" alt="PDF" className="h-10 w-10" />
              <div className="text-left">
                <p
                  className="text-sm font-medium text-slate-700"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              onClick={() => onFileSelect?.(null)}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {(() => {
        const helperMessage = error || rejection?.errors?.[0]?.message;
        if (!helperMessage) return null;

        const tone = error ? "text-red-600" : "text-amber-600";

        return (
          <p
            id={helperId}
            className={cn("mt-3 text-sm font-semibold", tone)}
            role="alert"
          >
            {helperMessage}
          </p>
        );
      })()}
    </div>
  );
};

export default FileUploader;
