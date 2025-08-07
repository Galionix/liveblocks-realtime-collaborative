import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';

// Initialize the Liveblocks client
const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Define presence and storage types
type Presence = {
  cursor: { x: number; y: number } | null;
  textCursor: { position: number; selection?: { start: number; end: number } } | null;
  isTyping: boolean;
  user?: {
    name: string;
    color: string;
  };
};

type Storage = {
  // Document text content
  text: string;
  // Comments data
  comments: Record<string, {
    id: string;
    text: string;
    author: string;
    timestamp: number;
    position?: { x: number; y: number };
    replies?: Array<{
      id: string;
      text: string;
      author: string;
      timestamp: number;
    }>;
  }>;
};

// Create the room context
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useOthers,
  useOthersMapped,
  useBroadcastEvent,
  useEventListener,
  useStorage,
  useMutation,
  useCanUndo,
  useCanRedo,
  useUndo,
  useRedo,
  useUpdateMyPresence,
} = createRoomContext<Presence, Storage>(client);
