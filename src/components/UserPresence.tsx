"use client";

import { useMemo } from 'react';

import { useMyPresence, useOthers } from '../lib/liveblocks';

export function UserPresence() {
  const [myPresence] = useMyPresence();
  const othersPresence = useOthers();

  const users = useMemo(() => {
    const allUsers = [];

    // Add current user
    if (myPresence.user) {
      allUsers.push({
        ...myPresence.user,
        isMe: true,
      });
    }

    // Add other users
    othersPresence.forEach((other) => {
      if (other.presence.user) {
        allUsers.push({
          ...other.presence.user,
          isMe: false,
        });
      }
    });

    return allUsers;
  }, [myPresence, othersPresence]);

  return (
    <div className="fixed top-4 right-4 flex space-x-2 z-40">
      {users.map((user, index) => (
        <div
          key={index}
          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium text-white ${
            user.isMe ? "ring-2 ring-white" : "ring-green-500"
          }`}
          style={{ backgroundColor: user.color }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
          <span>{user.name}</span>
          {user.isMe && <span className="text-xs opacity-75">(You)</span>}
        </div>
      ))}
      {users.length === 0 && (
        <div className="px-3 py-2 bg-gray-500 text-white text-sm rounded-full">
          No users online
        </div>
      )}
    </div>
  );
}
