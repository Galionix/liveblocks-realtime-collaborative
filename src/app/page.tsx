"use client";

import { useEffect, useState } from 'react';

import { CollaborativeEditor } from '../components/CollaborativeEditor';
import { LiveComments } from '../components/LiveComments';
import { LiveCursors } from '../components/LiveCursors';
import { UserPresence } from '../components/UserPresence';
import { RoomProvider, useUpdateMyPresence } from '../lib/liveblocks';
import { getRandomColor, getRandomUserName } from '../lib/utils';

function CollaborativeApp() {
  const updateMyPresence = useUpdateMyPresence();
  const [user] = useState(() => ({
    name: getRandomUserName(),
    color: getRandomColor(),
  }));

  useEffect(() => {
    // Set user info in presence
    updateMyPresence({ user });
  }, [updateMyPresence, user]);

  return (
    <div className="h-screen bg-gray-100">
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
              You are: <span className="font-medium" style={{ color: user.color }}>
                {user.name}
              </span>
            </div>
            <UserPresence />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="h-[calc(100vh-200px)] flex">
        {/* Editor */}
        <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200">
          <CollaborativeEditor />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white m-4 ml-0 rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Features Demo</h3>
          <div className="space-y-4 text-sm text-gray-600">
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
              <h4 className="font-medium text-purple-800 mb-1">�️ Live Comments</h4>
              <p>Double-click anywhere outside text to add general comments</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-800 mb-1">�👥 User Presence</h4>
              <p>See who's online in the header</p>
            </div>
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
      </main>

      {/* Live features */}
      <LiveCursors />
      <LiveComments />
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
