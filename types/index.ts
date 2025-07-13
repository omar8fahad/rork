export type Routine = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: {
    type: 'daily' | 'weekly' | 'specific-days';
    days?: number[]; // 0 = Sunday, 1 = Monday, etc.
    timesPerWeek?: number;
  };
  goalType: 'completion' | 'counter' | 'duration';
  goalValue?: number; // For counter or duration
  goalUnit?: string; // For counter or duration (e.g., "pages", "minutes")
  createdAt: number;
  updatedAt: number;
};

export type Task = {
  id: string;
  routineId: string;
  date: string; // ISO date string
  completed: boolean;
  progress?: number; // For counter or duration
  completedAt?: number;
};

export type QuranPage = {
  id: number; // 1-604
  isRead: boolean;
  isMemorized: boolean;
  isRevised: boolean;
  lastRead?: number; // timestamp
  lastMemorized?: number; // timestamp
  lastRevised?: number; // timestamp
};

export type Book = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverUrl?: string;
  startDate: number;
  lastReadDate?: number;
  completedDate?: number;
  readingSessions: {
    date: number;
    pagesRead: number;
  }[];
};

export type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: number;
  notifications: {
    enabled: boolean;
    dailyReminderTime: string; // HH:MM format
  };
};