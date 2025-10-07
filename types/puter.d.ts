export interface FSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  parent_id: string;
  parent_uid: string;
  created: number;
  modified: number;
  accessed: number;
  size: number | null;
  writable: boolean;
}

export interface PuterUser {
  uuid: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface KVItem {
  key: string;
  value: string;
}

export interface ChatMessageContentFile {
  type: "file";
  puter_path: string;
}

export interface ChatMessageContentText {
  type: "text";
  text: string;
}

export type ChatMessageContent =
  | ChatMessageContentFile
  | ChatMessageContentText;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | ChatMessageContent[];
}

export interface PuterChatFunction {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
}

export interface PuterChatOptions {
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  tools?: {
    type: "function";
    function: PuterChatFunction;
  }[];
}

export interface AIResponseMessage {
  role: string;
  content: string | unknown[];
  refusal?: string | null;
  annotations?: unknown[];
}

export interface AIResponseUsageItem {
  type: string;
  model: string;
  amount: number;
  cost: number;
}

export interface AIResponse {
  index: number;
  message: AIResponseMessage;
  logprobs: unknown | null;
  finish_reason: string;
  usage: AIResponseUsageItem[];
  via_ai_chat_service?: boolean;
}
