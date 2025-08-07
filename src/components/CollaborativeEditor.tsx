"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

import { useMutation, useStorage, useUpdateMyPresence } from '../lib/liveblocks';
import { generateId } from '../lib/utils';
import { TextCursors } from './TextCursors';

export function CollaborativeEditor() {
  const updateMyPresence = useUpdateMyPresence();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentData, setCommentData] = useState<{
    selectedText: string;
    position: { start: number; end: number };
    rect: DOMRect | null;
  } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [currentUser] = useState(() => `User ${Math.floor(Math.random() * 1000)}`);

  // Get the current text from Liveblocks storage
  const text = useStorage((root) => root.text);

  // Mutation to update the text in storage
  const updateText = useMutation(({ storage }, newText: string) => {
    storage.set("text", newText);
  }, []);

  // Mutation to add a text comment
  const addTextComment = useMutation(({ storage }, comment: any) => {
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

  // Handle double click for text comments
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
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
  }, [text]);

  // Helper function to find word boundaries
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

  // Handle adding comment
  const handleAddComment = useCallback(() => {
    if (!commentText.trim() || !commentData) return;

    const comment = {
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
          className="w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white text-gray-900 min-h-96"
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
              <span className="text-xs text-gray-500">Commenting on:</span>
              <div className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono">
                "{commentData.selectedText}"
              </div>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your comment..."
              className="w-full p-2 border border-gray-200 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <TypingIndicators />
    </div>
  );
}

function TextComments({ textareaRef }: { textareaRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const comments = useStorage((root) => root.comments);
  const text = useStorage((root) => root.text) || "";
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [currentUser] = useState(() => `User ${Math.floor(Math.random() * 1000)}`);

  // Mutation to add a reply to a text comment
  const addReply = useMutation(({ storage }, commentId: string, reply: any) => {
    const commentsMap = storage.get("comments") || {};
    const comment = commentsMap[commentId];
    if (comment) {
      const replies = comment.replies || [];
      replies.push(reply);
      comment.replies = replies;
      storage.set("comments", commentsMap);
    }
  }, []);

  const handleAddReply = useCallback((commentId: string) => {
    if (replyText.trim()) {
      addReply(commentId, {
        id: generateId(),
        text: replyText.trim(),
        author: currentUser,
        timestamp: Date.now(),
      });
      setReplyText("");
      setExpandedComment(null);
    }
  }, [replyText, currentUser, addReply]);

  if (!comments || !textareaRef.current) return null;

  // Filter text comments
  const textComments = Object.values(comments).filter(
    (comment: any) => comment.type === 'text' && comment.textSelection
  );

  return (
    <>
      {textComments.map((comment: any) => {
        // Calculate position for comment indicator
        const textareaRect = textareaRef.current?.getBoundingClientRect();
        if (!textareaRect) return null;

        // Simple approximation - position based on character count
        // In a real implementation, you'd calculate exact text position
        const textBefore = text.substring(0, comment.textSelection.start);
        const lineCount = (textBefore.match(/\n/g) || []).length;
        const lineHeight = 20; // Approximate line height

        const top = textareaRect.top + 16 + (lineCount * lineHeight); // 16px for padding
        const left = textareaRect.left + 16; // Simple left positioning

        return (
          <div
            key={comment.id}
            className="absolute pointer-events-auto"
            style={{
              left: left,
              top: top,
              transform: "translateY(-50%)",
            }}
          >
            {/* Comment indicator */}
            <div
              className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-pointer shadow-lg flex items-center justify-center text-xs"
              onClick={() => setExpandedComment(
                expandedComment === comment.id ? null : comment.id
              )}
              title={`Comment on: "${comment.textSelection.selectedText}"`}
            >
              💬
            </div>

            {/* Comment popup */}
            {expandedComment === comment.id && (
              <div className="absolute left-6 top-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 max-h-60 overflow-y-auto transform -translate-y-1/2">
                {/* Original text */}
                <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <span className="text-xs text-gray-500">Commented text:</span>
                  <div className="font-mono text-sm">"{comment.textSelection.selectedText}"</div>
                </div>

                {/* Main comment */}
                <div className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm text-gray-800">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="border-t pt-2 mb-2">
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id} className="mb-2 pl-2 border-l-2 border-gray-200">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-xs text-gray-600">{reply.author}</span>
                          <span className="text-xs text-gray-400">
                            {new Date(reply.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply form */}
                <div className="border-t pt-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-200 rounded text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-1">
                    <button
                      onClick={() => setExpandedComment(null)}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
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
