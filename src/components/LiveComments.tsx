"use client";

import { useCallback, useState } from 'react';

import { useMutation, useStorage } from '../lib/liveblocks';
import { generateId } from '../lib/utils';

type Comment = {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  position?: { x: number; y: number };
  replies?: Array<{
    id: string;
    text: string;
    author: string;
    timestamp: number;
  }>;
};

export function LiveComments() {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [currentUser] = useState(() => `User ${Math.floor(Math.random() * 1000)}`);

  // Get comments from storage
  const comments = useStorage((root) => root.comments);

  // Mutation to add a new comment
  const addComment = useMutation(({ storage }, comment: Comment) => {
    const commentsMap = storage.get("comments") || {};
    commentsMap[comment.id] = comment;
    storage.set("comments", commentsMap);
  }, []);

  // Mutation to add a reply to a comment
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

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setCommentPosition({ x: e.clientX, y: e.clientY });
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

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      onDoubleClick={handleDoubleClick}
      style={{ pointerEvents: isAddingComment ? "auto" : "none" }}
    >
      {/* Existing comments */}
      {comments && Object.values(comments).map((comment) => (
        <CommentBubble
          key={comment.id}
          comment={comment}
          onAddReply={(reply) => addReply(comment.id, reply)}
          currentUser={currentUser}
        />
      ))}

      {/* New comment form */}
      {isAddingComment && commentPosition && (
        <div
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 pointer-events-auto"
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
              disabled={!newCommentText.trim()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white text-xs px-3 py-2 rounded pointer-events-auto">
        Double-click anywhere to add a comment
      </div>
    </div>
  );
}

function CommentBubble({
  comment,
  onAddReply,
  currentUser
}: {
  comment: Comment;
  onAddReply: (reply: any) => void;
  currentUser: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleAddReply = () => {
    if (replyText.trim()) {
      onAddReply({
        id: generateId(),
        text: replyText.trim(),
        author: currentUser,
        timestamp: Date.now(),
      });
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  if (!comment.position) return null;

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: comment.position.x,
        top: comment.position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      {/* Comment indicator */}
      <div
        className="w-6 h-6 bg-yellow-400 border-2 border-white rounded-full cursor-pointer shadow-lg flex items-center justify-center text-xs font-bold"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        💬
      </div>

      {/* Comment popup */}
      {isExpanded && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 max-h-80 overflow-y-auto">
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
              {comment.replies.map((reply) => (
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
          {showReplyForm ? (
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
                  onClick={() => setShowReplyForm(false)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReply}
                  disabled={!replyText.trim()}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowReplyForm(true)}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1"
            >
              Reply
            </button>
          )}
        </div>
      )}
    </div>
  );
}
