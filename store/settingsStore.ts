import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';
import { colors } from '@/constants/colors';

interface SettingsState {
  settings: AppSettings;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: number) => void;
  toggleNotifications: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        theme: 'light',
        accentColor: colors.light.primary,
        fontSize: 16,
        notifications: {
          enabled: true,
          dailyReminderTime: '08:00',
        },
      },
      setTheme: (theme) => 
        set((state) => ({
          settings: { ...state.settings, theme }
        })),
      setAccentColor: (accentColor) => 
        set((state) => ({
          settings: { ...state.settings, accentColor }
        })),
      setFontSize: (fontSize) => 
        set((state) => ({
          settings: { ...state.settings, fontSize }
        })),
      toggleNotifications: (enabled) => 
        set((state) => ({
          settings: { 
            ...state.settings, 
            notifications: { 
              ...state.settings.notifications, 
              enabled 
            } 
          }
        })),
      setDailyReminderTime: (dailyReminderTime) => 
        set((state) => ({
          settings: { 
            ...state.settings, 
            notifications: { 
              ...state.settings.notifications, 
              dailyReminderTime 
            } 
          }
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);