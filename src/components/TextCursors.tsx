"use client";

import { useEffect, useMemo, useState } from 'react';

import { useOthers } from '../lib/liveblocks';

interface TextCursorsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  text: string;
}

export function TextCursors({ textareaRef, text }: TextCursorsProps) {
  const others = useOthers();
  const [scrollState, setScrollState] = useState({ scrollTop: 0, scrollLeft: 0 });

  // Listen for scroll events
  const textareaElement = textareaRef.current;

  useEffect(() => {
    if (!textareaElement) return;

    const handleScroll = () => {
      setScrollState({
        scrollTop: textareaElement.scrollTop,
        scrollLeft: textareaElement.scrollLeft,
      });
    };

    textareaElement.addEventListener('scroll', handleScroll);
    return () => textareaElement.removeEventListener('scroll', handleScroll);
  }, [textareaElement]);

  const textCursors = useMemo(() => {
    if (!textareaRef.current || !text) return [];

    return others
      .filter((other) => other.presence.textCursor && other.presence.user)
      .map((other) => {
        const textCursor = other.presence.textCursor!;
        const user = other.presence.user!;

        // Calculate cursor position in textarea
        const position = getTextareaCoordinates(textareaRef.current!, textCursor.position, text);

        return {
          ...position,
          user,
          connectionId: other.connectionId,
        };
      })
      .filter((cursor) => cursor.x !== null && cursor.y !== null)
      .filter((cursor) => {
        // Check if cursor is visible within textarea bounds
        if (!textareaRef.current) return false;

        const textareaRect = textareaRef.current.getBoundingClientRect();
        const isVisible =
          cursor.x! >= textareaRect.left &&
          cursor.x! <= textareaRect.right &&
          cursor.y! >= textareaRect.top &&
          cursor.y! <= textareaRect.bottom;

        return isVisible;
      });
  }, [others, textareaRef, text, scrollState]); // добавляем scrollState в зависимости

  return (
    <>
      {textCursors.map((cursor) => (
        <TextCursor
          key={cursor.connectionId}
          x={cursor.x!}
          y={cursor.y!}
          user={cursor.user}
        />
      ))}
    </>
  );
}

function TextCursor({ x, y, user }: { x: number; y: number; user: { name: string; color: string } }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed pointer-events-none z-30"
      style={{
        left: x,
        top: y,
        transform: "translateX(-1px)",
      }}
    >
      {/* Cursor line */}
      <div
        className="w-0.5 h-5 animate-pulse pointer-events-auto"
        style={{ backgroundColor: user.color }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {/* User label - показывается только при наведении */}
      {isHovered && (
        <div
          className="absolute -top-6 left-0 px-1 py-0.5 text-xs text-white rounded whitespace-nowrap"
          style={{ backgroundColor: user.color }}
        >
          {user.name}
        </div>
      )}
    </div>
  );
}

// Helper function to calculate cursor position in textarea
function getTextareaCoordinates(
  textarea: HTMLTextAreaElement,
  cursorPosition: number,
  text: string
): { x: number | null; y: number | null } {
  try {
    // Get textarea position and styles
    const textareaRect = textarea.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(textarea);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingTop = parseFloat(computedStyle.paddingTop);

    // Get scroll position
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;

    // Get text up to cursor position
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLineText = lines[currentLineIndex];

    // Calculate line height
    const fontSize = parseFloat(computedStyle.fontSize);
    const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.2;

    // Calculate Y position (line number * line height) - scroll offset + half line height for vertical centering
    const y = textareaRect.top + paddingTop + (currentLineIndex * lineHeight) - scrollTop;

    // Calculate X position using canvas for accurate text measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { x: null, y: null };

    // Set font to match textarea
    ctx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Measure width of current line text
    const textWidth = ctx.measureText(currentLineText).width;
    const x = textareaRect.left + paddingLeft + textWidth - scrollLeft;

    return { x, y };
  } catch (error) {
    console.error('Error calculating cursor position:', error);
    return { x: null, y: null };
  }
}
