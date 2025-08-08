# Liveblocks Real-Time Collaborative Editor

A demonstration of real-time collaboration features using Liveblocks React SDK. This project showcases live cursors, presence indicators, collaborative text editing, and live commenting system.

## 🚀 Features

### ✅ Implemented Features:
1. **Real-time Presence System** - Live cursors and user awareness indicators
2. **Collaborative Text Editing** - Real-time text synchronization with conflict resolution
3. **Live Comments** - Contextual commenting with threaded discussions
4. **Multi-Room Support** - Create and switch between different documents

### 🛠️ Tech Stack:
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Real-time**: Liveblocks React SDK
- **Deployment**: Ready for Vercel/Netlify

## 🏃‍♂️ Quick Start

### Prerequisites:
- Node.js 18+ and npm
- Liveblocks account (free at [liveblocks.io](https://liveblocks.io))

### Setup:
1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd liveblocks-realtime-collaborative
   npm install
   ```

2. **Configure Liveblocks:**
   - Create account at [liveblocks.io/dashboard](https://liveblocks.io/dashboard)
   - Copy your public API key
   - Update `.env.local`:
     ```
     NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_public_key_here
     ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open multiple browser windows:**
   - Navigate to `http://localhost:3000`
   - Open in multiple tabs/windows to see real-time collaboration

## 🎯 Demo Features

### 🖱️ Live Cursors
- Move your mouse to see real-time cursor tracking
- Each user gets a unique color and name
- Cursors disappear when users leave

### ✏️ Collaborative Editing
- Type in the text editor simultaneously with other users
- Real-time text synchronization
- Automatic conflict resolution using Liveblocks CRDT
- No data loss during concurrent edits

### 💬 Live Comments
- **Double-click anywhere** to add contextual comments
- Threaded reply system for discussions
- Real-time comment updates
- Comments positioned where you clicked

### 👥 User Presence
- See all online users in the top-right corner
- Color-coded user identification
- Real-time join/leave notifications

### 📁 Multi-Room Support
- **Create new documents** using the "+ New" button
- **Switch between documents** from the document selector
- **Delete documents** with the trash icon (hover to reveal)
- **Persistent document list** stored in browser localStorage
- Each document has its own isolated collaboration space

## 🏗️ Architecture

### Liveblocks Integration:
```typescript
// Dynamic room-based architecture
- Room ID: dynamically selected from room list
- Presence: { cursor, isTyping, user }
- Storage: { text, comments } per room
```

### Real-time Patterns:
- **Presence**: User cursors and status updates
- **Storage**: Persistent collaborative data (text, comments)
- **Mutations**: Atomic updates with conflict resolution
- **Hooks**: React integration with automatic re-renders

### Conflict Resolution:
- Uses Liveblocks CRDT (Conflict-free Replicated Data Types)
- Automatic merge of concurrent edits
- Preserves user intentions during simultaneous changes
- No manual conflict resolution required

## 🔧 Development

### Project Structure:
```
src/
├── app/page.tsx              # Main application page with room management
├── lib/
│   ├── liveblocks.ts         # Liveblocks configuration
│   └── utils.ts              # Utility functions
└── components/
    ├── rooms/
    │   └── RoomSelector.tsx   # Document/room selection interface
    ├── editor/
    │   └── CollaborativeEditor.tsx # Text editor with sync
    ├── comments/              # Comment system components
    ├── cursors/               # Live cursor components
    └── presence/              # User presence components
```

### Key Files:
- **`liveblocks.ts`**: Client setup and TypeScript types
- **`page.tsx`**: RoomProvider wrapper, room management, and main UI
- **`RoomSelector.tsx`**: Document creation and selection interface
- **Components**: Modular real-time features organized by functionality

## 🚀 Deployment

### Environment Variables:
```bash
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_live_...
```

### Deploy to Vercel:
```bash
npm run build
# Deploy with your preferred method
```

## 🧪 Testing Real-time Features

1. **Open multiple browser windows** to `localhost:3000`
2. **Test cursors**: Move mouse in different windows
3. **Test editing**: Type simultaneously in text editor
4. **Test comments**: Double-click to add comments in different windows
5. **Test presence**: Open/close windows to see user join/leave
6. **Test rooms**: Create new documents and switch between them

## ⚡ Performance Considerations

- **Throttled updates**: Cursor movements are throttled to prevent spam
- **Efficient re-renders**: Uses Liveblocks React hooks for optimized updates
- **Memory management**: Proper cleanup of event listeners
- **Network optimization**: Automatic batching of changes

## 🔮 Scaling Considerations

For production use, consider:
- **Authentication**: Replace random user names with real auth
- **Permissions**: Add room access controls
- **Persistence**: Add database integration for permanent storage
- **Monitoring**: Add error tracking and analytics
- **Rate limiting**: Implement user action throttling

## 📚 Resources

- [Liveblocks Documentation](https://liveblocks.io/docs)
- [Real-time Collaboration Patterns](https://liveblocks.io/docs/guides)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 System Design Notes

### Room Architecture:
- **Dynamic room creation** for multiple documents
- **Isolated collaboration spaces** per document
- **Persistent room list** in browser localStorage
- **Presence data** separated from **persistent storage** per room

### Conflict Resolution Strategy:
- **CRDT-based** automatic merging (Liveblocks handles this)
- **Last-writer-wins** for simple properties
- **Operational transforms** for text editing

### Trade-offs Made:
- **Simplicity over advanced features** for clear demonstration
- **localStorage rooms** instead of server-side room management
- **Basic user system** instead of full authentication
- **Client-side room storage** instead of persistent database

This demonstrates core real-time collaboration patterns while keeping the implementation focused and understandable.
