const STORAGE_KEY = 'glownote-preferences';

export type Theme = 'system' | 'light' | 'dark';
export type Direction = 'ltr' | 'rtl';

export interface GlowNotePreferences {
  theme: Theme;
  direction: Direction;
}

export const defaultPreferences: GlowNotePreferences = {
  theme: 'system',
  direction: 'ltr',
};

export function getPreferences(): GlowNotePreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultPreferences;
    }

    return {
      ...defaultPreferences,
      ...JSON.parse(stored),
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: GlowNotePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
