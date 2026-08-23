// Centralized store for the application
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  ayahId: string;
  ayahReference: string;
  text: string;
  dateStr: string; // ISO format or Hijri format
  timestamp: number;
}

export interface Bookmark {
  ayahId: string;
  ayahReference: string;
  textUthmani: string;
  timestamp: number;
}

export type Frequency = 'daily' | 'bidaily' | 'weekly';

export interface AppState {
  // Settings
  theme: 'light' | 'dark' | 'auto';
  textSize: 'normal' | 'large';
  notificationEnabled: boolean;
  notificationTime: string;
  hasOnboarded: boolean;
  frequency: Frequency;

  // Session State
  completedSessions: Record<string, string>; // dateStr -> ayahId

  // Journal
  journalEntries: JournalEntry[];

  // Bookmarks
  bookmarks: Bookmark[];

  // Actions
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setTextSize: (size: 'normal' | 'large') => void;
  setNotification: (enabled: boolean, time?: string) => void;
  setFrequency: (freq: Frequency) => void;
  completeOnboarding: () => void;
  markSessionCompleted: (dateStr: string, ayahId: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  deleteJournalEntry: (id: string) => void;
  toggleBookmark: (ayahId: string, ayahReference: string, textUthmani: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      textSize: 'normal',
      notificationEnabled: false,
      notificationTime: '07:00',
      hasOnboarded: false,
      frequency: 'daily',
      completedSessions: {},
      journalEntries: [],
      bookmarks: [],

      setTheme: (theme) => set({ theme }),
      setTextSize: (textSize) => set({ textSize }),
      setNotification: (enabled, time) => set((state) => ({ 
        notificationEnabled: enabled, 
        notificationTime: time ?? state.notificationTime 
      })),
      setFrequency: (frequency) => set({ frequency }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      markSessionCompleted: (dateStr, ayahId) => set((state) => ({
        completedSessions: { ...state.completedSessions, [dateStr]: ayahId }
      })),
      addJournalEntry: (entry) => set((state) => ({
        journalEntries: [
          { ...entry, id: crypto.randomUUID(), timestamp: Date.now() },
          ...state.journalEntries
        ]
      })),
      deleteJournalEntry: (id) => set((state) => ({
        journalEntries: state.journalEntries.filter(e => e.id !== id)
      })),
      toggleBookmark: (ayahId, ayahReference, textUthmani) => set((state) => {
        const exists = state.bookmarks.find(b => b.ayahId === ayahId);
        if (exists) {
          return { bookmarks: state.bookmarks.filter(b => b.ayahId !== ayahId) };
        }
        return { 
          bookmarks: [
            { ayahId, ayahReference, textUthmani, timestamp: Date.now() },
            ...state.bookmarks
          ] 
        };
      })
    }),
    {
      name: 'tdbr-storage',
    }
  )
);
