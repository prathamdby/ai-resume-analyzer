export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;
let workerInstance: Worker | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  loadPromise = import("pdfjs-dist").then((lib) => {
    // Set up a bundler-managed worker so versions always match
    if (typeof window === "undefined") {
      throw new Error("PDF rendering is only available in the browser");
    }
    
    // Reuse existing worker or create new
    if (!workerInstance) {
      workerInstance = new Worker(
        new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url),
        { type: "module" },
      );
    }
    
    lib.GlobalWorkerOptions.workerPort = workerInstance;
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

// Export cleanup function for worker termination
export function terminatePdfWorker() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    pdfjsLib = null;
    loadPromise = null;
  }
}

export async function convertPdfToImage(
  file: File,
): Promise<PdfConversionResult> {
  const startTime = performance.now();
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    // Reduced scale from 4 to 2 for better performance (4x less memory)
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      // Try WebP first, fallback to PNG
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      const supportsWebP = testCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      
      const format = supportsWebP ? 'image/webp' : 'image/png';
      const quality = supportsWebP ? 0.9 : 1.0;
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const ext = supportsWebP ? '.webp' : '.png';
            const imageFile = new File([blob], `${originalName}${ext}`, {
              type: format,
            });

            const duration = performance.now() - startTime;
            console.log(`PDF conversion took ${duration.toFixed(2)}ms`);

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        format,
        quality,
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
