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
