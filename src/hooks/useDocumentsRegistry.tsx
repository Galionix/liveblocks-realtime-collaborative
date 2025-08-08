'use client';

import { useEffect, useState } from 'react';
import { createClient, LiveMap } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import { generateId } from '../lib/utils';

// Define the document metadata type (JSON-compatible for Liveblocks)
export interface DocumentMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  lastActive: number;
  createdBy?: string;
  [key: string]: string | number | undefined; // Index signature for JSON compatibility
}

// Create a separate client instance for the documents registry
const registryClient = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Define types for the registry room
type RegistryPresence = {
  user?: {
    name: string;
    color: string;
  };
};

type RegistryStorage = {
  documents: LiveMap<string, DocumentMetadata>;
};

// Create the registry room context
const {
  RoomProvider: RegistryRoomProvider,
  useStorage: useRegistryStorage,
  useMutation: useRegistryMutation,
} = createRoomContext<RegistryPresence, RegistryStorage>(registryClient);

// Documents Registry Provider Component
export function DocumentsRegistryProvider({ children }: { children: React.ReactNode }) {
  return (
    <RegistryRoomProvider id="documents-registry" initialStorage={{ documents: new LiveMap() }}>
      {children}
    </RegistryRoomProvider>
  );
}

// Custom hook to manage documents registry
export function useDocumentsRegistry() {
  const documents = useRegistryStorage(root => root.documents);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateDocuments = useRegistryMutation(({ storage }, documentsMap: Record<string, DocumentMetadata>) => {
    const documentsLiveMap = storage.get('documents');
    // Clear existing documents
    const currentKeys = Array.from(documentsLiveMap.keys());
    currentKeys.forEach(key => documentsLiveMap.delete(key));

    // Add new documents
    Object.entries(documentsMap).forEach(([id, doc]) => {
      documentsLiveMap.set(id, doc);
    });
  }, []);

  const addDocument = useRegistryMutation(({ storage }, doc: DocumentMetadata) => {
    storage.get('documents').set(doc.id, doc);
  }, []);

  const updateDocument = useRegistryMutation(({ storage }, docId: string, updates: Partial<DocumentMetadata>) => {
    const documentsLiveMap = storage.get('documents');
    const existingDoc = documentsLiveMap.get(docId);
    if (existingDoc) {
      documentsLiveMap.set(docId, { ...existingDoc, ...updates });
    }
  }, []);

  const removeDocument = useRegistryMutation(({ storage }, docId: string) => {
    storage.get('documents').delete(docId);
  }, []);

  // Initialize with localStorage data on first load
  useEffect(() => {
    if (documents && !isInitialized) {
      const documentsSize = Array.from(documents.keys()).length;

      if (documentsSize === 0) {
        // Only migrate if documents registry is empty
        try {
          const localRooms = localStorage.getItem('collaborative-rooms');
          if (localRooms) {
            const parsedRooms: Array<{
              id: string;
              name: string;
              description?: string;
              createdAt: number;
              lastActive: number;
            }> = JSON.parse(localRooms);
            const documentsMap: Record<string, DocumentMetadata> = {};

            parsedRooms.forEach((room) => {
              documentsMap[room.id] = {
                id: room.id,
                name: room.name,
                description: room.description,
                createdAt: room.createdAt,
                lastActive: room.lastActive,
              };
            });

            updateDocuments(documentsMap);
          } else {
            // Create default document if none exists
            const defaultDoc: DocumentMetadata = {
              id: 'collaborative-demo-room',
              name: 'Demo Document',
              description: 'A demonstration of real-time collaborative editing',
              createdAt: Date.now(),
              lastActive: Date.now(),
            };
            addDocument(defaultDoc);
          }
        } catch (error) {
          console.error('Failed to migrate from localStorage:', error);
          // Create default document on error
          const defaultDoc: DocumentMetadata = {
            id: 'collaborative-demo-room',
            name: 'Demo Document',
            description: 'A demonstration of real-time collaborative editing',
            createdAt: Date.now(),
            lastActive: Date.now(),
          };
          addDocument(defaultDoc);
        }
      }

      setIsInitialized(true);
      setIsLoading(false);
    } else if (documents && isInitialized && isLoading) {
      // Just set loading to false if already initialized
      setIsLoading(false);
    }
  }, [documents, isInitialized, isLoading]); // Removed addDocument and updateDocuments from dependencies

  // Convert to array and sort by last active
  const documentsArray = documents ? Array.from(documents.entries()).map(([, doc]) => doc).sort((a, b) => b.lastActive - a.lastActive) : [];

  const createDocument = (name: string, description?: string): DocumentMetadata => {
    const newDoc: DocumentMetadata = {
      id: generateId(),
      name: name.trim(),
      description: description?.trim(),
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    addDocument(newDoc);
    return newDoc;
  };

  const deleteDocument = (docId: string) => {
    removeDocument(docId);
  };

  const updateDocumentActivity = (docId: string) => {
    updateDocument(docId, { lastActive: Date.now() });
  };

  return {
    documents: documentsArray,
    isLoading,
    createDocument,
    deleteDocument,
    updateDocumentActivity,
    updateDocument,
  };
}
