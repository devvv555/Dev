import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppThemeMode = 'LIGHT' | 'DARK';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  cardBackground: string;
  cardBorder: string;
  headerBackground: string;
  headerBorder: string;
  bottomBarBackground: string;
  bottomBarBorder: string;
  brandPrimary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  pillBackground: string;
  pillBorder: string;
  statusSafe: string;
  statusSafeBg: string;
  statusWarning: string;
  statusDanger: string;
  avatarBg: string;
  avatarText: string;
  trackBg: string;
}

export const THEMES: Record<AppThemeMode, ThemeColors> = {
  // Pure Executive Light (exactly matching the user-uploaded STARK ONE screenshot)
  LIGHT: {
    isDark: false,
    background: '#F1F5F9', // Crisp soft off-white/slate
    cardBackground: '#FFFFFF', // Pure white card
    cardBorder: '#E2E8F0', // Crisp subtle border
    headerBackground: '#F8FAFC',
    headerBorder: '#E2E8F0',
    bottomBarBackground: '#FFFFFF',
    bottomBarBorder: '#E2E8F0',
    brandPrimary: '#2B3990', // Deep Royal Navy Stark Indigo
    accent: '#3B82F6',
    textPrimary: '#0F172A', // Deep Black / Slate 900
    textSecondary: '#334155', // Slate 700
    textMuted: '#64748B', // Slate 500
    textInverse: '#FFFFFF',
    pillBackground: '#F8FAFC',
    pillBorder: '#CBD5E1',
    statusSafe: '#10B981', // Mint / Emerald safe
    statusSafeBg: 'rgba(16, 185, 129, 0.15)',
    statusWarning: '#F59E0B',
    statusDanger: '#EF4444',
    avatarBg: '#3B49DF', // Royal Blue circle
    avatarText: '#FFFFFF',
    trackBg: '#E2E8F0',
  },

  // Stealth Dark / Titanium Obsidian Matrix
  DARK: {
    isDark: true,
    background: '#0B0202', // Or #050505 OLED
    cardBackground: '#121212',
    cardBorder: '#262626',
    headerBackground: '#121212',
    headerBorder: '#262626',
    bottomBarBackground: '#121212',
    bottomBarBorder: '#262626',
    brandPrimary: '#10B981', // Emerald Matrix
    accent: '#38BDF8',
    textPrimary: '#FFFFFF',
    textSecondary: '#CBD5E1',
    textMuted: '#9CA3AF',
    textInverse: '#050505',
    pillBackground: '#050505',
    pillBorder: '#262626',
    statusSafe: '#10B981',
    statusSafeBg: 'rgba(16, 185, 129, 0.15)',
    statusWarning: '#FBBF24',
    statusDanger: '#F87171',
    avatarBg: 'rgba(16, 185, 129, 0.2)',
    avatarText: '#10B981',
    trackBg: '#050505',
  },
};

const THEME_STORAGE_KEY = '@app_theme_mode_v3';

let currentThemeMode: AppThemeMode = 'LIGHT'; // Default to user's desired clean Light theme
const listeners: Array<(theme: AppThemeMode) => void> = [];

export const ThemeManager = {
  async init(): Promise<AppThemeMode> {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'LIGHT' || saved === 'DARK') {
        currentThemeMode = saved;
      } else {
        currentThemeMode = 'LIGHT'; // Default to Light theme
        await AsyncStorage.setItem(THEME_STORAGE_KEY, 'LIGHT');
      }
    } catch {
      currentThemeMode = 'LIGHT';
    }
    return currentThemeMode;
  },

  getMode(): AppThemeMode {
    return currentThemeMode;
  },

  getTheme(): ThemeColors {
    return THEMES[currentThemeMode];
  },

  async setMode(mode: AppThemeMode): Promise<void> {
    currentThemeMode = mode;
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
    listeners.forEach((fn) => fn(mode));
  },

  async toggleTheme(): Promise<AppThemeMode> {
    const nextMode: AppThemeMode = currentThemeMode === 'LIGHT' ? 'DARK' : 'LIGHT';
    await this.setMode(nextMode);
    return nextMode;
  },

  subscribe(listener: (theme: AppThemeMode) => void): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },
};
