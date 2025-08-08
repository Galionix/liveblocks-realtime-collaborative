/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Get a random color for user identification
 */
export function getRandomColor(): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get a random user name
 */
export function getRandomUserName(): string {
  const adjectives = ["Happy", "Creative", "Brilliant", "Energetic", "Friendly"];
  const nouns = ["Designer", "Developer", "Writer", "Artist", "Thinker"];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 999);

  return `${adjective} ${noun} ${number}`;
}

/**
 * Calculate precise character position in a textarea element
 * @param textarea - The textarea element
 * @param text - The text content of the textarea
 * @param charIndex - The character index to get position for
 * @returns Object with x and y coordinates relative to textarea
 */
export function getCharacterPosition(
  textarea: HTMLTextAreaElement, 
  text: string, 
  charIndex: number
): { x: number; y: number } {
  const computedStyle = window.getComputedStyle(textarea);
  const fontSize = parseFloat(computedStyle.fontSize);
  const lineHeight = parseFloat(computedStyle.lineHeight) || fontSize * 1.2;
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 16;
  const paddingTop = parseFloat(computedStyle.paddingTop) || 16;

  // Get text content up to the character
  const textBefore = text.substring(0, charIndex);
  const lines = textBefore.split('\n');
  const lineIndex = lines.length - 1;

  // Create a temporary canvas to measure text width precisely
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (context) {
    context.font = `${fontSize}px ${computedStyle.fontFamily}`;
    const textWidth = context.measureText(lines[lineIndex]).width;
    
    return {
      x: paddingLeft + textWidth,
      y: paddingTop + (lineIndex * lineHeight)
    };
  }

  // Fallback to approximate calculation
  const charInLine = lines[lineIndex].length;
  const charWidth = fontSize * 0.6; // Approximate for monospace fonts
  return {
    x: paddingLeft + (charWidth * charInLine),
    y: paddingTop + (lineIndex * lineHeight)
  };
}

/**
 * Find word boundaries at a given position in text
 * @param text - The text to search in
 * @param position - The cursor position
 * @returns Object with start and end positions, or null if no word found
 */
export function getWordBounds(text: string, position: number): { start: number; end: number } | null {
  const before = text.slice(0, position);
  const after = text.slice(position);

  const wordStart = before.search(/\S+$/);
  const wordEnd = after.search(/\s/);

  if (wordStart === -1) return null;

  const start = wordStart === -1 ? position : before.length - before.length + wordStart;
  const end = wordEnd === -1 ? text.length : position + wordEnd;

  return { start, end };
}
