"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

import { useMutation, useStorage, useUpdateMyPresence } from '../lib/liveblocks';
import { TextCursors } from './TextCursors';

export function CollaborativeEditor() {
  const updateMyPresence = useUpdateMyPresence();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Get the current text from Liveblocks storage
  const text = useStorage((root) => root.text);

  // Mutation to update the text in storage
  const updateText = useMutation(({ storage }, newText: string) => {
    storage.set("text", newText);
  }, []);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    updateText(newText);
  }, [updateText]);

  // Handle typing indicators
  const handleKeyDown = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      updateMyPresence({ isTyping: true });
    }
  }, [isTyping, updateMyPresence]);

  const handleKeyUp = useCallback(() => {
    // Debounce typing indicator
    const timer = setTimeout(() => {
      setIsTyping(false);
      updateMyPresence({ isTyping: false });
    }, 1000);

    return () => clearTimeout(timer);
  }, [updateMyPresence]);

  // Handle cursor position changes
  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      const cursorPosition = textareaRef.current.selectionStart;
      const selectionEnd = textareaRef.current.selectionEnd;

      updateMyPresence({
        textCursor: {
          position: cursorPosition,
          selection: cursorPosition !== selectionEnd ?
            { start: cursorPosition, end: selectionEnd } : undefined
        }
      });
    }
  }, [updateMyPresence]);

  useEffect(() => {
    // Set initial text if not exists
    if (text === undefined) {
      updateText("# Welcome to Collaborative Document Editor\n\nStart typing to see real-time collaboration in action...");
    }
  }, [text, updateText]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Collaborative Document
        </h2>
        <p className="text-sm text-gray-600">
          Changes are automatically saved and synced in real-time
        </p>
      </div>

      <div className="flex-1 p-4 relative">
        <textarea
          ref={textareaRef}
          value={text || ""}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onSelect={handleSelectionChange}
          onClick={handleSelectionChange}
          className="w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white text-gray-900 min-h-96"
          placeholder="Start typing your document here..."
          spellCheck="false"
        />
        <TextCursors textareaRef={textareaRef} text={text || ""} />
      </div>

      <TypingIndicators />
    </div>
  );
}

function TypingIndicators() {
  const others = useStorage((root) => root);

  // This is a simplified version - in real implementation you'd track typing users
  return (
    <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500">
      Real-time collaboration active
    </div>
  );
}
