"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoomSelector } from '../components/rooms';

export default function Home() {
  const router = useRouter();
  const [isRoomSelectorExpanded, setIsRoomSelectorExpanded] = useState<boolean>(false);

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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Live Collaborative Editor
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time collaboration platform with live cursors, presence indicators,
              collaborative text editing, and contextual commenting system
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Document Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-12">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Choose a Document</h2>
            <p className="text-gray-600">Select an existing document or create a new one to start collaborating</p>
          </div>
          <div className="relative">
            <RoomSelector
              onRoomSelect={handleRoomSelect}
              isExpanded={isRoomSelectorExpanded}
              onToggle={toggleRoomSelector}
              showAsFullList={true}
            />
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">✨ Features</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🖱️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Live Cursors</h4>
                  <p className="text-gray-600 text-sm">See real-time cursor movements of all collaborators with unique colors and names</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">✏️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Collaborative Editing</h4>
                  <p className="text-gray-600 text-sm">Real-time text synchronization with automatic conflict resolution using CRDTs</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Text Comments</h4>
                  <p className="text-gray-600 text-sm">Double-click on any text to add contextual comments with threaded replies</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💭</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Live Comments</h4>
                  <p className="text-gray-600 text-sm">Add general comments anywhere in the document for broader discussions</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">User Presence</h4>
                  <p className="text-gray-600 text-sm">See who&apos;s online and actively editing in real-time</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📁</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Multiple Documents</h4>
                  <p className="text-gray-600 text-sm">Create, manage, and share multiple documents with URL-based routing</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">🚀 Tech Stack</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-800">Frontend</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• Next.js 15 with App Router</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-800">Real-time</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• Liveblocks React SDK</li>
                  <li>• CRDT-based conflict resolution</li>
                  <li>• WebSocket connections</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-gray-800">Features</h4>
                <ul className="text-sm text-gray-600 mt-1 space-y-1">
                  <li>• Multi-room support</li>
                  <li>• URL-based document sharing</li>
                  <li>• Persistent local storage</li>
                </ul>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Getting Started</h4>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Select a document from above</li>
                  <li>2. Share the URL with collaborators</li>
                  <li>3. Start editing together in real-time!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ready to Start Collaborating?</h3>
          <p className="text-gray-600 mb-6">Choose a document above or create a new one to experience real-time collaboration</p>
          <button
            onClick={() => setIsRoomSelectorExpanded(true)}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Select Document
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-6 mt-12">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </footer>
    </div>
  );
}