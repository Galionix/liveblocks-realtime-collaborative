"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentsRegistry } from '../../hooks/useDocumentsRegistry';

interface RoomSelectorProps {
  onRoomSelect: (roomId: string) => void;
  currentRoomId?: string;
  isExpanded: boolean;
  onToggle: () => void;
  showAsFullList?: boolean;
}

export function RoomSelector({ onRoomSelect, currentRoomId, isExpanded, onToggle, showAsFullList = false }: RoomSelectorProps) {
  const router = useRouter();
  const {
    documents,
    createDocument,
    deleteDocument,
    updateDocumentActivity,
  } = useDocumentsRegistry();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;

    const newDoc = createDocument(newRoomName, newRoomDescription);

    // Clear form
    setNewRoomName("");
    setNewRoomDescription("");
    setShowCreateForm(false);

    // Auto-select the new room
    handleRoomSelect(newDoc.id);
  };

  const handleRoomSelect = (roomId: string) => {
    // Update last active time
    updateDocumentActivity(roomId);

    // Navigate to document page if in full list mode, otherwise just select
    if (showAsFullList) {
      router.push(`/document/${encodeURIComponent(roomId)}`);
    } else {
      onRoomSelect(roomId);
    }
  };

  const handleDeleteRoom = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (documents.length <= 1) {
      alert('Cannot delete the last room. At least one room must exist.');
      return;
    }

    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      deleteDocument(roomId);

      // If the deleted room was currently selected, select the first available room
      if (currentRoomId === roomId && documents.length > 1) {
        const remainingDocs = documents.filter(doc => doc.id !== roomId);
        if (remainingDocs.length > 0) {
          handleRoomSelect(remainingDocs[0].id);
        }
      }
    }
  };

  const handleShareRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const shareUrl = `${window.location.origin}/document/${encodeURIComponent(roomId)}`;

      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      // Fallback - show URL in alert
      const shareUrl = `${window.location.origin}/document/${encodeURIComponent(roomId)}`;
      alert(`Copy this URL to share:\n${shareUrl}`);
    }
  };

  const formatLastActive = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get current room info
  const currentRoom = documents.find(doc => doc.id === currentRoomId);

  return (
    <div className="relative" data-room-selector>
      {/* Show full list mode for home page */}
      {showAsFullList ? (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">All Documents</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateForm(!showCreateForm);
              }}
              className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {showCreateForm ? 'Cancel' : '+ New Document'}
            </button>
          </div>

          {/* Create room form */}
          {showCreateForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Document name"
                className="w-full p-3 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-black placeholder-gray-500"
                autoFocus
              />
              <input
                type="text"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full p-3 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-black placeholder-gray-500"
              />
              <div className="flex space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateRoom();
                  }}
                  disabled={!newRoomName.trim()}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateForm(false);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Show copied message */}
          {showCopiedMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm">
              Link copied to clipboard!
            </div>
          )}

          {/* Room grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((room) => (
              <div
                key={room.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoomSelect(room.id);
                }}
                className="p-4 rounded-lg cursor-pointer transition-colors group bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-blue-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate pr-2">
                    {room.name}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id, e);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete room"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {room.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {room.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last active: {formatLastActive(room.lastActive)}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareRoom(room.id, e);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 transition-all font-medium"
                    title="Copy link"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Dropdown mode for document page */
        <>
          {/* Current room display and toggle button */}
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={onToggle}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-800">
                  {currentRoom?.name || 'Select Document'}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                  Active
                </span>
              </div>
              {currentRoom?.description && (
                <p className="text-sm text-gray-600 mt-1">{currentRoom.description}</p>
              )}
            </div>

            {/* Toggle button */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Dropdown panel */}
          {isExpanded && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">All Documents</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateForm(!showCreateForm);
                    }}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    {showCreateForm ? 'Cancel' : '+ New'}
                  </button>
                </div>

                {/* Create room form */}
                {showCreateForm && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="Document name"
                      className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-black placeholder-gray-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-black placeholder-gray-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateRoom();
                        }}
                        disabled={!newRoomName.trim()}
                        className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowCreateForm(false);
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Room list */}
                <div className="space-y-2">
                  {documents.map((room) => (
                    <div
                      key={room.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoomSelect(room.id);
                        onToggle(); // Close dropdown after selection
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        currentRoomId === room.id
                          ? 'bg-blue-100 border-2 border-blue-300'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {room.name}
                            </h4>
                            {currentRoomId === room.id && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">
                                Current
                              </span>
                            )}
                          </div>
                          {room.description && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {room.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Last active: {formatLastActive(room.lastActive)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id, e);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all ml-2"
                          title="Delete room"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
