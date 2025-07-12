import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book } from '@/types';

interface BookState {
  books: Book[];
  addBook: (book: Omit<Book, 'id' | 'startDate' | 'readingSessions'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  updateReadingProgress: (id: string, currentPage: number) => void;
  getActiveBooks: () => Book[];
  getCompletedBooks: () => Book[];
}

export const useBookStore = create<BookState>()(
  persist(
    (set, get) => ({
      books: [],
      addBook: (bookData) => {
        const book: Book = {
          ...bookData,
          id: Date.now().toString(),
          startDate: Date.now(),
          currentPage: 0,
          readingSessions: [],
        };
        set((state) => ({
          books: [...state.books, book],
        }));
      },
      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id ? { ...book, ...updates } : book
          ),
        }));
      },
      deleteBook: (id) => {
        set((state) => ({
          books: state.books.filter((book) => book.id !== id),
        }));
      },
      updateReadingProgress: (id, currentPage) => {
        set((state) => {
          const book = state.books.find((b) => b.id === id);
          if (!book) return state;
          
          const now = Date.now();
          const pagesRead = currentPage - book.currentPage;
          
          // Only record if pages were actually read
          if (pagesRead <= 0) {
            return {
              books: state.books.map((b) =>
                b.id === id ? { ...b, currentPage } : b
              ),
            };
          }
          
          const newSession = {
            date: now,
            pagesRead,
          };
          
          const isCompleted = currentPage >= book.totalPages;
          
          return {
            books: state.books.map((b) =>
              b.id === id
                ? {
                    ...b,
                    currentPage,
                    lastReadDate: now,
                    ...(isCompleted && { completedDate: now }),
                    readingSessions: [...b.readingSessions, newSession],
                  }
                : b
            ),
          };
        });
      },
      getActiveBooks: () => {
        return get().books.filter((book) => !book.completedDate);
      },
      getCompletedBooks: () => {
        return get().books.filter((book) => book.completedDate);
      },
    }),
    {
      name: 'books-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);