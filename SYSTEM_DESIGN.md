# System Design Document: Real-Time Collaborative Editor

## Executive Summary

This document outlines the architecture and technical decisions for a real-time collaborative text editor built using Liveblocks, Next.js 15, and TypeScript. The system implements live cursors, presence indicators, collaborative text editing, and contextual commenting with a multi-document architecture.

## Architecture Overview

### High-Level Architecture

The application follows a **multi-room architecture** where each document exists as an isolated Liveblocks room, with a separate meta-room managing the global document registry. This design ensures data isolation while enabling centralized document management.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                   │
├─────────────────────────────────────────────────────────────┤
│  React Components     │  Custom Hooks    │  Liveblocks SDK  │
│  ┌─────────────────┐  │  ┌─────────────┐ │  ┌─────────────┐  │
│  │ CollaborativeEditor│ │ │useDocuments│ │  │ useStorage  │  │
│  │ TextCursors     │  │  │Registry     │ │  │ usePresence │  │
│  │ LiveComments    │  │  │             │ │  │ useMutation │  │
│  │ UserPresence    │  │  └─────────────┘ │  └─────────────┘  │
│  │ RoomSelector    │  │                  │                  │
│  └─────────────────┘  │                  │                  │
├─────────────────────────────────────────────────────────────┤
│                    Liveblocks Infrastructure                │
├─────────────────────────────────────────────────────────────┤
│     Meta Room              │        Document Rooms         │
│  ┌─────────────────┐       │  ┌─────────────────────────┐   │
│  │ Document Registry│       │  │ Room: doc-id-1         │   │
│  │ LiveMap<string, │       │  │ Storage: {text, comments}│   │
│  │ DocumentMetadata>│       │  │ Presence: {cursor, user}│   │
│  └─────────────────┘       │  └─────────────────────────┘   │
│                            │  ┌─────────────────────────┐   │
│                            │  │ Room: doc-id-2         │   │
│                            │  │ Storage: {text, comments}│   │
│                            │  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Core Technical Decisions

1. **Dual Room Architecture**: Separation of document metadata (meta-room) from document content (individual rooms)
2. **CRDT-Based Conflict Resolution**: Leveraging Liveblocks' built-in Conflict-free Replicated Data Types
3. **Hook-Based State Management**: Custom hooks abstracting Liveblocks complexity
4. **Component Modularity**: Feature-specific components for cursors, comments, and presence

## Data Synchronization Strategy

### Room Structure

Each document room contains two primary data types:

```typescript
type Storage = {
  text: string;                           // Main document content
  comments: Record<string, Comment>;      // Contextual comments
};

type Presence = {
  cursor: { x: number; y: number } | null;              // Mouse position
  textCursor: { position: number; selection?: { start: number; end: number } } | null;  // Text cursor
  isTyping: boolean;                                     // Typing indicator
  user?: { name: string; color: string };               // User identity
};
```

### Multi-Room Document Registry

The document registry operates as a separate Liveblocks room using `LiveMap` for synchronized metadata:

```typescript
type RegistryStorage = {
  documents: LiveMap<string, DocumentMetadata>;
};

interface DocumentMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  lastActive: number;
}
```

This approach provides:
- **Centralized Discovery**: All users see the same document list
- **Real-time Updates**: Document creation/deletion syncs across clients
- **Data Isolation**: Document content remains separated
- **Scalability**: Easy addition of metadata fields

## Liveblocks Integration Approach

### React Hooks Pattern

The integration follows a custom hook pattern that wraps Liveblocks primitives:

```typescript
// Primary document hooks
const text = useStorage((root) => root.text);
const updateText = useMutation(({ storage }, newText: string) => {
  storage.set("text", newText);
}, []);

// Registry management hook
const { documents, createDocument, deleteDocument } = useDocumentsRegistry();
```

### Presence Management

Real-time presence is handled through multiple presence indicators:

1. **Live Cursors**: Mouse position tracking with throttled updates
2. **Text Cursors**: Textarea cursor position with scroll compensation
3. **User Awareness**: Online/offline status with color-coded identification
4. **Typing Indicators**: Debounced typing status updates

### Performance Optimizations

- **Throttled Updates**: Cursor movements limited to ~60fps
- **Efficient Re-renders**: Memoized calculations for cursor positions
- **Selective Subscriptions**: Component-specific Liveblocks hook usage
- **Memory Management**: Proper cleanup of event listeners and timeouts

## Conflict Resolution Strategy

### CRDT-Based Resolution

The system relies entirely on Liveblocks' built-in CRDT implementation:

1. **Text Editing**: Operational Transform algorithms handle concurrent text modifications
2. **Comment System**: Last-writer-wins with timestamp-based ordering
3. **Document Metadata**: Atomic updates prevent inconsistent states
4. **Presence Data**: Ephemeral data with automatic cleanup

### Concurrent Edit Handling

```typescript
// Automatic conflict resolution example
const updateText = useMutation(({ storage }, newText: string) => {
  storage.set("text", newText);  // Liveblocks handles merging
}, []);
```

This approach ensures:
- **No Data Loss**: All user inputs are preserved during conflicts
- **Deterministic Results**: Same final state across all clients
- **Transparent Merging**: No manual intervention required
- **Intention Preservation**: User actions maintain semantic meaning

## Performance Considerations

### Real-Time Update Optimization

1. **Cursor Throttling**: 16ms intervals prevent excessive network traffic
2. **Batch Updates**: Liveblocks automatically batches rapid changes
3. **Smart Re-rendering**: React hooks prevent unnecessary component updates
4. **Viewport Culling**: Cursors outside visible area are filtered

### Scalability Patterns

```typescript
// Throttled cursor updates
const throttledHandleScroll = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(handleScroll, 16); // ~60fps
};

// Efficient cursor position calculation
const textCursors = useMemo(() => {
  return others
    .filter((other) => other.presence.textCursor && other.presence.user)
    .map(calculateCursorPosition)
    .filter(isVisibleInViewport);
}, [others, textareaRef, text, refreshKey]);
```

### Memory Management

- **Event Listener Cleanup**: Proper useEffect cleanup functions
- **Canvas Context Reuse**: Single canvas for text measurement
- **Debounced Operations**: Typing indicators and scroll handlers
- **Optimistic Updates**: Immediate UI updates with eventual consistency

## Trade-offs and Constraints

### Feature Prioritization Decisions

Given time constraints, the following features were implemented vs. deferred:

**✅ Implemented:**
- Real-time presence system with live cursors and user awareness indicators
- Collaborative text editing with automatic conflict resolution
- Live commenting system with contextual text selection
- Multiplayer data synchronization for document metadata and content

**❌ Deferred:**
- AI Copilot integration for collaborative assistance
- Real-time notifications system for comments
- Live activity feed for user actions
- Advanced permission systems

### Technical Trade-offsconsole.log();

1. **Simplicity vs. Features**: Chose straightforward textarea over rich text editor for faster implementation
2. **Client-side Storage**: Used browser localStorage for document registry fallback instead of server-side persistence
3. **Basic Authentication**: Random user generation instead of full user management system
4. **Performance vs. Features**: Prioritized smooth real-time experience over advanced editing features

### Architectural Constraints

1. **Liveblocks Limitations**: JSON-serializable data types only
2. **React Hook Dependencies**: Careful management to prevent infinite re-render loops
3. **Browser Compatibility**: Canvas-based text measurement for cross-browser cursor positioning
4. **Network Resilience**: Automatic reconnection handled by Liveblocks infrastructure

## Conclusion

This architecture successfully demonstrates core real-time collaboration patterns while maintaining clean separation of concerns and optimal performance. The dual-room approach enables both centralized document management and isolated collaborative spaces, providing a solid foundation for scaling to more advanced features.

The system's strength lies in its modular design, leveraging Liveblocks' robust CRDT implementation while maintaining flexibility for future enhancements. The performance optimizations ensure smooth real-time interactions even with multiple concurrent users, making it suitable for production-scale collaborative editing scenarios.

---

*System Design Document v1.0 - Created for Liveblocks Real-Time Collaborative Editor*
