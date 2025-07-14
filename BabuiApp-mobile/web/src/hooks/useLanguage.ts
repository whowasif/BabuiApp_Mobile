import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LanguageState {
  language: 'bn' | 'en';
  setLanguage: (language: 'bn' | 'en') => void;
  t: (key: string, bnText: string, enText: string) => string;
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'bn',
      setLanguage: (language) => {
        set({ language });
        // Update document direction for RTL
        document.documentElement.dir = language === 'bn' ? 'ltr' : 'ltr';
        document.documentElement.lang = language === 'bn' ? 'bn' : 'en';
      },
      t: (key: string, bnText: string, enText: string) => {
        const { language } = get();
        return language === 'bn' ? bnText : enText;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);