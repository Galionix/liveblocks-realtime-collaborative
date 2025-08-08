"use client";

import { useState } from 'react';
import { CommentFormData } from '../shared/types';

interface CommentFormProps {
  commentData: CommentFormData;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function CommentForm({ commentData, onSubmit, onCancel }: CommentFormProps) {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = () => {
    if (commentText.trim()) {
      onSubmit(commentText.trim());
      setCommentText("");
    }
  };

  return (
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
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!commentText.trim()}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Comment
        </button>
      </div>
    </div>
  );
}
