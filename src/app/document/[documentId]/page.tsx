"use client";

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { CollaborativeEditor } from '../../../components/editor';
import { LiveComments } from '../../../components/comments';
import { LiveCursors } from '../../../components/cursors';
import { UserPresence } from '../../../components/presence';
import { RoomSelector } from '../../../components/rooms';
import { RoomProvider, useUpdateMyPresence } from '../../../lib/liveblocks';
import { getRandomColor, getRandomUserName } from '../../../lib/utils';

function CollaborativeApp() {
  const updateMyPresence = useUpdateMyPresence();
  const [user, setUser] = useState<{ name: string; color: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize user on client side only
  useEffect(() => {
    setUser({
      name: getRandomUserName(),
      color: getRandomColor(),
    });
  }, []);

  const setTextareaRef = (ref: HTMLTextAreaElement | null) => {
    textareaRef.current = ref;
  };

  useEffect(() => {
    // Set user info in presence
    if (user) {
      updateMyPresence({ user });
    }
  }, [updateMyPresence, user]);

  return (
    <div className="h-full bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Live Collaborative Editor
            </h1>
            <p className="text-sm text-gray-600">
              Real-time collaboration with live cursors, presence, and comments
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              You are: {user ? (
                <span className="font-medium" style={{ color: user.color }}>
                  {user.name}
                </span>
              ) : (
                <span className="font-medium">Loading...</span>
              )}
            </div>
            <UserPresence />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
          <CollaborativeEditor setTextareaRef={setTextareaRef} />
        </div>
      </main>

      {/* Live features */}
      <LiveCursors />
      <LiveComments textareaRef={textareaRef} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 mt-auto">
        <div className="flex justify-center items-center text-sm text-gray-600">
          <span>Created by</span>
          <a
            href="https://github.com/Galionix"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Dmitry Halaktionov
          </a>
          <span className="mx-1">•</span>
          <a
            href="https://github.com/Galionix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            @Galionix
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [isRoomSelectorExpanded, setIsRoomSelectorExpanded] = useState<boolean>(false);
  const documentId = params.documentId as string;

  const handleRoomSelect = (roomId: string) => {
    router.push(`/document/${roomId}`);
  };

  const toggleRoomSelector = () => {
    setIsRoomSelectorExpanded(!isRoomSelectorExpanded);
  };

  // Close room selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isRoomSelectorExpanded) {
        const target = event.target as Element;
        const roomSelector = document.querySelector('[data-room-selector]');
        if (roomSelector && !roomSelector.contains(target)) {
          setIsRoomSelectorExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRoomSelectorExpanded]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Room Selector - Outside RoomProvider */}
      <div className="bg-white border-b border-gray-200 relative">
        <RoomSelector
          onRoomSelect={handleRoomSelect}
          currentRoomId={documentId}
          isExpanded={isRoomSelectorExpanded}
          onToggle={toggleRoomSelector}
        />
      </div>

      {/* Collaborative App - Inside RoomProvider */}
      <div className="flex-1">
        <RoomProvider
          id={documentId}
          initialPresence={{
            cursor: null,
            textCursor: null,
            isTyping: false,
          }}
          initialStorage={{
            text: "",
            comments: {},
          }}
        >
          <CollaborativeApp />
        </RoomProvider>
      </div>
    </div>
  );
}
