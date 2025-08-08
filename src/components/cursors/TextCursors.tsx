"use client";

import { useMemo, useState, useEffect } from 'react';

import { useOthers } from '../../lib/liveblocks';

interface TextCursorsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  text: string;
}

export function TextCursors({ textareaRef, text }: TextCursorsProps) {
  const others = useOthers();
  const [refreshKey, setRefreshKey] = useState(0);

  // Track scroll position changes to update cursor positions
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleScroll = () => {
      // Trigger re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    };

    // Throttle scroll events for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 16); // ~60fps
    };

    textarea.addEventListener('scroll', throttledHandleScroll);

    return () => {
      textarea.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [textareaRef]);

  const textCursors = useMemo(() => {
    if (!textareaRef.current || !text) return [];

    // Force recalculation on scroll (refreshKey is used as dependency)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = refreshKey;

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
  }, [others, textareaRef, text, refreshKey]);

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

    // Calculate Y position relative to textarea content, then add textarea position
    // Учитываем скролл и добавляем немного отступа для центрирования курсора на строке
    const relativeY = (currentLineIndex * lineHeight) - scrollTop + (lineHeight * 0.1);
    const y = textareaRect.top + paddingTop + relativeY;

    // Calculate X position using canvas for accurate text measurement
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { x: null, y: null };

    // Set font to match textarea
    ctx.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    // Measure width of current line text
    const textWidth = ctx.measureText(currentLineText).width;
    const x = textareaRect.left + paddingLeft + textWidth - scrollLeft;

    // Проверяем, что позиция находится в пределах видимой области textarea
    const minY = textareaRect.top + paddingTop;
    const maxY = textareaRect.bottom - paddingTop;

    // Если курсор вне видимой области, возвращаем null
    if (y < minY || y > maxY) {
      return { x: null, y: null };
    }

    return { x, y };
  } catch (error) {
    console.error('Error calculating cursor position:', error);
    return { x: null, y: null };
  }
}
