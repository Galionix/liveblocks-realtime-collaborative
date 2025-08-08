"use client";

import { useEffect, useMemo } from 'react';

import { useOthersMapped, useUpdateMyPresence } from '../../lib/liveblocks';

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
      const cursor = { x: e.clientX, y: e.clientY };
      updateMyPresence({ cursor });
    };

    const handlePointerLeave = () => {
      updateMyPresence({ cursor: null });
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [updateMyPresence]);

  return (
    <>
      {cursors.map(({ x, y, user }, index) => (
        <Cursor key={index} x={x} y={y} user={user} />
      ))}
    </>
  );
}

function Cursor({ x, y, user }: Cursor) {
  return (
    <div
      className="pointer-events-none fixed z-50 transition-transform duration-100"
      style={{
        left: x,
        top: y,
      }}
    >
      {/* Cursor pointer */}
      <svg
        className="relative"
        width="24"
        height="36"
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
        className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded-md whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  );
}
