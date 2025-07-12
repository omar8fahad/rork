import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuranPage } from '@/types';

interface QuranState {
  pages: QuranPage[];
  initializePages: () => void;
  updatePageStatus: (pageId: number, status: QuranPage['status']) => void;
  getStats: () => {
    totalRead: number;
    totalMemorized: number;
    totalRevised: number;
    completionPercentage: number;
  };
  getPagesToRevise: (limit?: number) => QuranPage[];
}

// Initialize with 604 pages
const createInitialPages = (): QuranPage[] => {
  return Array.from({ length: 604 }, (_, i) => ({
    id: i + 1,
    status: 'none',
  }));
};

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      pages: [],
      initializePages: () => {
        set({ pages: createInitialPages() });
      },
      updatePageStatus: (pageId, status) => {
        set((state) => ({
          pages: state.pages.map((page) => {
            if (page.id === pageId) {
              const now = Date.now();
              return {
                ...page,
                status,
                ...(status === 'read' && { lastRead: now }),
                ...(status === 'memorized' && { lastMemorized: now }),
                ...(status === 'revised' && { lastRevised: now }),
              };
            }
            return page;
          }),
        }));
      },
      getStats: () => {
        const pages = get().pages;
        const totalRead = pages.filter((p) => p.status === 'read').length;
        const totalMemorized = pages.filter((p) => p.status === 'memorized').length;
        const totalRevised = pages.filter((p) => p.status === 'revised').length;
        const completionPercentage = (totalMemorized / 604) * 100;
        
        return {
          totalRead,
          totalMemorized,
          totalRevised,
          completionPercentage,
        };
      },
      getPagesToRevise: (limit = 10) => {
        const memorizedPages = get().pages.filter(
          (p) => p.status === 'memorized' || p.status === 'revised'
        );
        
        // Sort by last revised date (oldest first)
        return [...memorizedPages]
          .sort((a, b) => {
            const aTime = a.lastRevised || a.lastMemorized || 0;
            const bTime = b.lastRevised || b.lastMemorized || 0;
            return aTime - bTime;
          })
          .slice(0, limit);
      },
    }),
    {
      name: 'quran-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        return (state) => {
          // If no pages exist, initialize them
          if (!state || !state.pages || state.pages.length === 0) {
            state?.initializePages();
          }
        };
      },
    }
  )
);