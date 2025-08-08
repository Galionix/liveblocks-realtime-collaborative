import { useState } from 'react';
import { Comment, Reply } from '../shared/types';
import { generateId } from '../../lib/utils';

export const CommentBubble = ({
  comment,
  onAddReply,
  currentUser,
  scrollOffset
}: {
  comment: Comment;
  onAddReply: (reply: Reply) => void;
  currentUser: string;
  scrollOffset: { x: number; y: number };
}) => {
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
      className="absolute pointer-events-auto z-40"
      style={{
        left: comment.position.x + scrollOffset.x,
        top: comment.position.y + scrollOffset.y,
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
              <span className="font-medium text-sm text-gray-900">{comment.author}</span>
              <span className="text-xs text-gray-600">
                {new Date(comment.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-gray-900">{comment.text}</p>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="border-t pt-2 mb-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="mb-2 pl-2 border-l-2 border-gray-200">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-xs text-gray-800">{reply.author}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(reply.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-900">{reply.text}</p>
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
                className="w-full p-2 border border-gray-200 rounded text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-1">
                <button
                  onClick={() => setShowReplyForm(false)}
                  className="px-2 py-1 text-xs text-gray-700 hover:text-gray-900"
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
