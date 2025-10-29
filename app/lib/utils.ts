import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a byte value into a human-readable string with appropriate units.
 *
 * @param bytes - The number of bytes to format
 * @returns A formatted string with the size and appropriate unit (Bytes, KB, MB, GB)
 *
 * @example
 * formatSize(1024) // "1 KB"
 * formatSize(1536) // "1.5 KB"
 * formatSize(0) // "0 Bytes"
 */
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Generates a random UUID using the Web Crypto API.
 *
 * @returns A randomly generated UUID string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 *
 * @example
 * generateUUID() // "550e8400-e29b-41d4-a716-446655440000"
 */
export const generateUUID = () => crypto.randomUUID();

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 *
 * @param fn - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns The debounced function
 *
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 * debouncedSearch('hello'); // Called once after 300ms of no calls
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}