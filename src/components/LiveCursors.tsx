"use client";

import { useEffect, useMemo, useState } from 'react';

import { useOthersMapped, useUpdateMyPresence } from '../lib/liveblocks';

type Cursor = {
  x: number;
  y: number;
  user: {
    name: string;
    color: string;
  };
};

export function LiveCursors() {
  const updateMyPresence = useUpdateMyPresence();
  const [localCursor, setLocalCursor] = useState<{ x: number; y: number } | null>(null);

  // Get other users' cursors
  const others = useOthersMapped((other) => ({
    cursor: other.presence.cursor,
    user: other.presence.user,
  }));

  const cursors = useMemo(() => {
    return others
      .filter(([, data]) => data.cursor && data.user)
      .map(([, data]) => ({
        x: data.cursor!.x,
        y: data.cursor!.y,
        user: data.user!,
      }));
  }, [others]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      // Only track cursor within viewport bounds
      const cursor = { 
        x: Math.max(0, Math.min(e.clientX, window.innerWidth - 50)), 
        y: Math.max(0, Math.min(e.clientY, window.innerHeight - 50))
      };
      setLocalCursor(cursor);
      updateMyPresence({ cursor });
    };

    const handlePointerLeave = (e: PointerEvent) => {
      // Only hide cursor if actually leaving the window
      if (e.clientX < 0 || e.clientX > window.innerWidth || 
          e.clientY < 0 || e.clientY > window.innerHeight) {
        setLocalCursor(null);
        updateMyPresence({ cursor: null });
      }
    };

    // Use window instead of document for better control
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [updateMyPresence]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {cursors.map(({ x, y, user }, index) => (
        <Cursor key={index} x={x} y={y} user={user} />
      ))}
    </div>
  );
}

function Cursor({ x, y, user }: Cursor) {
  return (
    <div
      className="pointer-events-none absolute transition-all duration-75"
      style={{
        left: Math.max(0, Math.min(x, window.innerWidth - 200)),
        top: Math.max(0, Math.min(y, window.innerHeight - 100)),
      }}
    >
      {/* Cursor pointer */}
      <svg
        className="relative"
        width="20"
        height="20"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m13.67 6.03 8.64 16.64c.22.43-.12 1.03-.67.84l-6.56-2.05a.62.62 0 0 0-.43 0l-5.83 2.07c-.51.18-.86-.4-.64-.84L13.67 6.03c.17-.32.64-.32.8 0z"
          fill={user.color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      {/* User name label */}
      <div
        className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded-md whitespace-nowrap shadow-lg"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  );
}
