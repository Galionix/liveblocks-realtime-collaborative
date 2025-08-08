"use client";

import { useCallback, useState, useEffect } from 'react';

import { useMutation, useStorage } from '../../lib/liveblocks';
import { generateId } from '../../lib/utils';
import { CommentBubble } from './CommentBubble';
import { Comment, Reply } from '../shared/types';

interface LiveCommentsProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function LiveComments({ textareaRef }: LiveCommentsProps = {}) {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [currentUser] = useState(() => `User ${Math.floor(Math.random() * 1000)}`);
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });

  // Get comments from storage
  const comments = useStorage((root) => root.comments);

  // Listen for textarea scroll events
  useEffect(() => {
    if (!textareaRef?.current) return;

    const textarea = textareaRef.current;

    const handleScroll = () => {
      setScrollOffset({
        x: textarea.scrollLeft,
        y: textarea.scrollTop
      });
    };

    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, [textareaRef]);

  // Mutation to add a new comment
  const addComment = useMutation(({ storage }, comment: Comment) => {
    const commentsMap = storage.get("comments") || {};
    commentsMap[comment.id] = comment;
    storage.set("comments", commentsMap);
  }, []);

  // Mutation to add a reply to a comment
  const addReply = useMutation(({ storage }, commentId: string, reply: Reply) => {
    const commentsMap = storage.get("comments") || {};
    const comment = commentsMap[commentId];
    if (comment) {
      const replies = comment.replies || [];
      replies.push(reply);
      comment.replies = replies;
      storage.set("comments", commentsMap);
    }
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      const relativePosition = { x: e.clientX, y: e.clientY };

      setCommentPosition({
        ...relativePosition,
      });
      setIsAddingComment(true);
    }
  }, []);

  const handleAddComment = useCallback(() => {
    if (newCommentText.trim() && commentPosition) {
      const comment: Comment = {
        id: generateId(),
        text: newCommentText.trim(),
        author: currentUser,
        timestamp: Date.now(),
        position: commentPosition,
        type: 'text',
      };
      addComment(comment);
      setNewCommentText("");
      setIsAddingComment(false);
      setCommentPosition(null);
    }
  }, [newCommentText, commentPosition, currentUser, addComment]);

  const handleCancelComment = useCallback(() => {
    setNewCommentText("");
    setIsAddingComment(false);
    setCommentPosition(null);
  }, []);

  // Calculate final position for comments considering scroll
  const getCommentPosition = (comment: Comment) => {
    if (comment.textareaPosition && textareaRef?.current) {
      const textareaRect = textareaRef.current.getBoundingClientRect();
      return {
        x: textareaRect.left + comment.textareaPosition.x - scrollOffset.x,
        y: textareaRect.top + comment.textareaPosition.y - scrollOffset.y
      };
    }
    return comment.position;
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      onDoubleClick={handleDoubleClick}
      style={{ pointerEvents: isAddingComment ? "auto" : "none" }}
    >
      {/* Existing comments */}
      {comments && Object.values(comments).map((comment) => {
        const position = getCommentPosition(comment);
        if (!position) return null;

        // Hide comments that are outside textarea bounds when textarea is available
        if (textareaRef?.current) {
          const textareaRect = textareaRef.current.getBoundingClientRect();
          if (position.x < textareaRect.left ||
              position.x > textareaRect.right ||
              position.y < textareaRect.top ||
              position.y > textareaRect.bottom) {
            return null;
          }
        }

        return (
          <CommentBubble
            key={comment.id}
            comment={{ ...comment, position }}
            onAddReply={(reply) => addReply(comment.id, reply)}
            currentUser={currentUser}
            scrollOffset={scrollOffset}
          />
        );
      })}

      {/* New comment form */}
      {isAddingComment && commentPosition && (
        <div
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 pointer-events-auto z-50"
          style={{
            left: commentPosition.x,
            top: commentPosition.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border border-gray-200 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
              disabled={!newCommentText.trim()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
