import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { cn, formatSize } from "~/lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const maxFileSize = 20 * 1024 * 1024;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
    },
    [onFileSelect],
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
  });

  const file = acceptedFiles[0] || null;
  const rejection = fileRejections[0];

  // Show toast when file is rejected
  useEffect(() => {
    if (rejection) {
      const error = rejection.errors[0];
      if (error?.code === "file-too-large") {
        toast.error("File too large", {
          description: "Please upload a PDF smaller than 20 MB.",
        });
      } else if (error?.code === "file-invalid-type") {
        toast.error("Invalid file type", {
          description: "Only PDF files are supported. Please upload a PDF resume.",
        });
      } else {
        toast.error("Upload error", {
          description: error?.message || "Please upload a valid PDF file.",
        });
      }
    }
  }, [rejection]);

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
          ),
        })}
      >
        <input {...getInputProps({ "aria-label": "Upload resume PDF" })} />

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

      {rejection && (
        <p className="mt-3 text-sm font-semibold text-amber-600" role="alert">
          {rejection.errors[0]?.message ||
            "Please upload a PDF smaller than 20 MB."}
        </p>
      )}
    </div>
  );
};

export default FileUploader;
