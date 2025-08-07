<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Liveblocks Real-Time Collaboration Project

This project demonstrates real-time collaborative features using Liveblocks React SDK.

## Key Technologies:
- Next.js 15 with App Router
- TypeScript
- Liveblocks React SDK for real-time collaboration
- Tailwind CSS for styling

## Project Structure:
- `src/lib/liveblocks.ts` - Liveblocks client configuration and room context
- `src/lib/utils.ts` - Utility functions for ID generation and user data
- `src/components/` - React components for collaborative features
  - `LiveCursors.tsx` - Real-time cursor tracking
  - `UserPresence.tsx` - Online user indicators
  - `CollaborativeEditor.tsx` - Real-time text editing
  - `LiveComments.tsx` - Comment system with threading

## Features Implemented:
1. **Live Cursors & Presence**: Real-time mouse cursor tracking and user awareness
2. **Collaborative Text Editing**: Simultaneous text editing with conflict resolution
3. **Live Comments**: Contextual commenting system with threaded replies

## Coding Guidelines:
- Use TypeScript for all components
- Follow React best practices with hooks
- Use Liveblocks hooks (useStorage, useMutation, usePresence) for real-time features
- Implement proper error handling for network failures
- Use Tailwind CSS for consistent styling
- Keep components focused and reusable

## Liveblocks Integration:
- Room-based architecture (one room per document)
- Presence for user awareness and cursors
- Storage for persistent collaborative data
- Real-time updates with automatic conflict resolution
