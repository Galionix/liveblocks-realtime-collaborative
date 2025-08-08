"use client";

import { useEffect, useRef, useState } from 'react';

import { CollaborativeEditor } from '../components/editor';
import { LiveComments } from '../components/comments';
import { LiveCursors } from '../components/cursors';
import { UserPresence } from '../components/presence';
import { RoomProvider, useUpdateMyPresence } from '../lib/liveblocks';
import { getRandomColor, getRandomUserName } from '../lib/utils';

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
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
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
      <main className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-0">
          <CollaborativeEditor setTextareaRef={setTextareaRef} />
        </div>

        {/* Sidebar */}
        <div className="w-auto lg:w-80 bg-white m-4 lg:ml-0 rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col min-h-0 overflow-hidden">
          <h3 className="font-semibold text-gray-800 mb-4">Features Demo</h3>
          <div className="space-y-4 text-sm text-gray-600 overflow-y-auto flex-1">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">🖱️ Live Cursors</h4>
              <p>Move your mouse to see real-time cursor tracking</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">✏️ Collaborative Editing</h4>
              <p>Type in the editor to see real-time text and cursor synchronization</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-1">💬 Text Comments</h4>
              <p>Double-click on any text in the editor to comment on it with threaded replies</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-1">💭 Live Comments</h4>
              <p>Double-click anywhere outside text to add general comments</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-1">👥 User Presence</h4>
              <p>See who&apos;s online in the header</p>
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">🚀 Tech Stack</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Next.js 15 + TypeScript</li>
                <li>• Liveblocks React SDK</li>
                <li>• Real-time presence</li>
                <li>• Collaborative storage</li>
                <li>• Tailwind CSS</li>
              </ul>
            </div>
          </div>
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

export default function Home() {
  return (
    <RoomProvider
      id="collaborative-demo-room"
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
  );
}
