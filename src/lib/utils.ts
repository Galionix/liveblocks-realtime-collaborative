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
