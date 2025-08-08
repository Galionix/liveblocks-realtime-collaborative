import { generateId, getCharacterPosition } from '@lrct/lib/utils';
import { useMutation, useStorage } from '@lrct/lib/liveblocks';
import { useCallback, useState, useEffect, useRef } from 'react';
import { Reply, Comment } from '../shared/types';

export const TextComments = ({ textareaRef, removeTextComment }: {
  removeTextComment: (commentId: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null> }) => {
  const comments = useStorage((root) => root.comments);
  const text = useStorage((root) => root.text) || "";
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [currentUser, setCurrentUser] = useState<string>("");
  const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
  const popupRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Initialize user on client side only
  useEffect(() => {
    setCurrentUser(`User ${Math.floor(Math.random() * 1000)}`);
  }, []);

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

  // Handle clicks outside comment popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      let isClickInsideCommentSystem = false;

      // Check if click is inside any comment popup or indicator
      popupRefs.current.forEach((popupElement) => {
        if (popupElement && popupElement.contains(target)) {
          isClickInsideCommentSystem = true;
        }
      });

      // Also check if click is on a comment indicator
      const commentIndicators = document.querySelectorAll('[data-comment-indicator]');
      commentIndicators.forEach((indicator) => {
        if (indicator.contains(target)) {
          isClickInsideCommentSystem = true;
        }
      });

      // Close expanded comment if click is outside
      if (!isClickInsideCommentSystem && expandedComment) {
        setExpandedComment(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedComment]);

  // Mutation to add a reply to a text comment
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

  const handleAddReply = useCallback((commentId: string) => {
    if (replyText.trim() && currentUser) {
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
    (comment: Comment) => comment.type === 'text' && comment.textSelection
  );

  return (
    <>
      {textComments.map((comment: Comment) => {
        // Calculate position for comment indicator
        const textareaRect = textareaRef.current?.getBoundingClientRect();
        const textarea = textareaRef.current;
        if (!textareaRect || !textarea || !comment.textSelection) return null;

        // Get precise character position
        const charPosition = getCharacterPosition(textarea, text, comment.textSelection.start);

        // Calculate position relative to viewport
        const top = textareaRect.top + charPosition.y - scrollOffset.y;
        const left = textareaRect.left + charPosition.x - scrollOffset.x;

        // Check if comment is visible within textarea bounds
        const isVisible = top >= textareaRect.top &&
                         top <= textareaRect.bottom &&
                         left >= textareaRect.left &&
                         left <= textareaRect.right;

        if (!isVisible) return null;

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
              data-comment-indicator
              className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-pointer shadow-lg flex items-center justify-center text-xs"
              onClick={() => setExpandedComment(
                expandedComment === comment.id ? null : comment.id
              )}
              title={`Comment on: "${comment.textSelection?.selectedText}"`}
            >
              💬
            </div>

            {/* Comment popup */}
            {expandedComment === comment.id && (
              <div
                ref={(el) => {
                  if (el) {
                    popupRefs.current.set(comment.id, el);
                  } else {
                    popupRefs.current.delete(comment.id);
                  }
                }}
                className="absolute left-6 top-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 w-64 max-h-60 overflow-y-auto transform -translate-y-1/2"
              >
                {/* Original text */}
                <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <span className="text-xs text-gray-500">Commented text:</span>
                  <div className="font-mono text-sm text-gray-900">&quot;{comment.textSelection?.selectedText}&quot;</div>
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
                    {comment.replies.map((reply: Reply) => (
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
                    className="w-full p-2 border border-gray-200 rounded text-xs resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-900"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2 mt-1">
                    <button
                      onClick={() => {
                        removeTextComment(comment.id);
                        setExpandedComment(null);
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Delete
                    </button>
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
