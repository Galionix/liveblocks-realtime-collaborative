"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

import { useMutation, useStorage, useUpdateMyPresence } from '../lib/liveblocks';
import { generateId } from '../lib/utils';
import { TextComments } from './TextComments';
import { TextCursors } from './cursors';
import { Comment } from './shared';

export function CollaborativeEditor({ setTextareaRef }: { setTextareaRef: (ref: HTMLTextAreaElement | null) => void }) {
  const updateMyPresence = useUpdateMyPresence();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setTextareaRef(textareaRef.current);
  }, [setTextareaRef]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentData, setCommentData] = useState<{
    selectedText: string;
    position: { start: number; end: number };
    rect: DOMRect | null;
  } | null>(null);
  console.log('commentData: ', commentData);
  const [commentText, setCommentText] = useState("");
  const [currentUser] = useState(() => `User ${Math.floor(Math.random() * 1000)}`);

  // Get the current text from Liveblocks storage
  const text = useStorage((root) => root.text);

  // Mutation to update the text in storage
  const updateText = useMutation(({ storage }, newText: string) => {
    storage.set("text", newText);
  }, []);

  // Mutation to add a text comment
  const addTextComment = useMutation(({ storage }, comment: Comment) => {
    const commentsMap = storage.get("comments") || {};
    commentsMap[comment.id] = comment;
    storage.set("comments", commentsMap);
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
  const getWordBounds = useCallback((text: string, position: number) => {
    const before = text.slice(0, position);
    const after = text.slice(position);

    const wordStart = before.search(/\S+$/);
    const wordEnd = after.search(/\s/);

    if (wordStart === -1) return null;

    const start = wordStart === -1 ? position : before.length - before.length + wordStart;
    const end = wordEnd === -1 ? text.length : position + wordEnd;

    return { start, end };
  }, []);
  // Handle double click for text comments
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    console.log('e: ', e);
    if (!textareaRef.current || !text) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If there's selected text, use it for comment
    if (start !== end) {
      const selectedText = text.substring(start, end);
      const rect = textarea.getBoundingClientRect();

      setCommentData({
        selectedText,
        position: { start, end },
        rect
      });
      setShowCommentForm(true);
    } else {
      // If no selection, select word under cursor
      const wordBounds = getWordBounds(text, start);
      if (wordBounds && wordBounds.start !== wordBounds.end) {
        const selectedText = text.substring(wordBounds.start, wordBounds.end);
        const rect = textarea.getBoundingClientRect();

        // Temporarily select the word to show user what's being commented on
        textarea.setSelectionRange(wordBounds.start, wordBounds.end);

        setCommentData({
          selectedText,
          position: wordBounds,
          rect
        });
        setShowCommentForm(true);
      }
    }
  }, [ text, getWordBounds]);

  // Helper function to find word boundaries


  // Handle adding comment
  const handleAddComment = useCallback(() => {
    if (!commentText.trim() || !commentData) return;

    const comment: Comment = {
      id: generateId(),
      text: commentText.trim(),
      author: currentUser,
      timestamp: Date.now(),
      type: 'text',
      textSelection: {
        start: commentData.position.start,
        end: commentData.position.end,
        selectedText: commentData.selectedText
      }
    };

    addTextComment(comment);
    setCommentText("");
    setShowCommentForm(false);
    setCommentData(null);
  }, [commentText, commentData, currentUser, addTextComment]);

  // Handle canceling comment
  const handleCancelComment = useCallback(() => {
    setCommentText("");
    setShowCommentForm(false);
    setCommentData(null);
  }, []);

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
          onDoubleClick={handleDoubleClick}
          className="w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white min-h-96"
          style={{ color: '#000000' }}
          placeholder="Start typing your document here..."
          spellCheck="false"
        />
        <TextCursors textareaRef={textareaRef} text={text || ""} />

        {/* Comment form */}
        {showCommentForm && commentData && (
          <div
            className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 z-50"
            style={{
              left: commentData.rect ? commentData.rect.left + commentData.rect.width / 2 : '50%',
              top: commentData.rect ? commentData.rect.top - 10 : '50%',
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="mb-2">
              <span className="text-xs text-gray-900">Commenting on:</span>
              <div className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono text-gray-900">
                &quot;{commentData.selectedText}&quot;
              </div>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your comment..."
              className="w-full p-2 border border-gray-200 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-900"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={handleCancelComment}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </div>
        )}
      </div>

      <TextComments textareaRef={textareaRef} />
      {/* <TypingIndicators /> */}
    </div>
  );
}

