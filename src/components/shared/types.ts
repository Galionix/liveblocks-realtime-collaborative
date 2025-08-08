export type Reply = {
  id: string;
  text: string;
  author: string;
  timestamp: number;
};

export type Comment = {
  type: string;
  id: string;
  text: string;
  author: string;
  timestamp: number;
  position?: { x: number; y: number };
  textareaPosition?: { x: number; y: number }; // Position relative to textarea
  replies?: Array<Reply>;
  textSelection?: {
    start: number;
    end: number;
    selectedText: string;
  };
};

export interface CommentFormData {
  selectedText: string;
  position: { start: number; end: number };
  rect: DOMRect | null;
}

export interface TextareaRef {
  current: HTMLTextAreaElement | null;
}
