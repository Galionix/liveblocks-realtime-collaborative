# Component Structure Documentation

## 🏗️ New Component Architecture

The project has been refactored with a modular component structure for better maintainability and scalability.

### 📁 Directory Structure

```
src/components/
├── shared/              # Shared types and utilities
│   ├── types.ts        # Common TypeScript interfaces
│   └── index.ts        # Barrel exports
├── editor/             # Text editor components
│   ├── CollaborativeEditor.tsx
│   └── index.ts
├── comments/           # Comment system components
│   ├── LiveComments.tsx      # General commenting
│   ├── TextComments.tsx      # Text-specific comments
│   ├── CommentBubble.tsx     # Comment UI bubble
│   ├── CommentForm.tsx       # Comment input form
│   └── index.ts
├── cursors/            # Cursor tracking components
│   ├── LiveCursors.tsx       # Real-time mouse cursors
│   ├── TextCursors.tsx       # Text selection cursors
│   └── index.ts
└── presence/           # User presence components
    ├── UserPresence.tsx      # Online users display
    └── index.ts
```

### 🔧 Key Improvements

1. **Separation of Concerns**: Each folder handles a specific feature area
2. **Reusable Components**: Extracted `CommentForm` from `CollaborativeEditor`
3. **Centralized Types**: All interfaces in `shared/types.ts`
4. **Clean Imports**: Barrel exports via `index.ts` files
5. **Modular Architecture**: Easy to extend and maintain

### 📝 Component Responsibilities

#### **Editor Components**
- `CollaborativeEditor`: Main text editor with real-time collaboration

#### **Comment Components**
- `LiveComments`: Handle general page comments
- `TextComments`: Handle text selection comments
- `CommentBubble`: Reusable comment display UI
- `CommentForm`: Reusable comment input form

#### **Cursor Components**
- `LiveCursors`: Track and display mouse cursors
- `TextCursors`: Track and display text selection cursors

#### **Presence Components**
- `UserPresence`: Display online users

#### **Shared**
- `types.ts`: TypeScript interfaces for `Comment`, `Reply`, `CommentFormData`

### 🚀 Usage Examples

```typescript
// Clean imports using barrel exports
import { CollaborativeEditor } from '../components/editor';
import { LiveComments, TextComments } from '../components/comments';
import { LiveCursors } from '../components/cursors';
import { UserPresence } from '../components/presence';
import { Comment, Reply } from '../components/shared/types';
```

### 🎯 Benefits

1. **Better Developer Experience**: Clear folder structure makes finding components easy
2. **Maintainability**: Related components are grouped together
3. **Scalability**: Easy to add new features in appropriate folders
4. **Code Reusability**: Extracted common components like `CommentForm`
5. **Type Safety**: Centralized type definitions prevent inconsistencies
