/**
 * PSGIM One Theme Configuration
 * Preset definitions for easy switching between Electric Blue and Monochrome Platinum/Black
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  borderHighlight: string;
  primary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export const THEME_PRESETS: Record<'ELECTRIC_BLUE' | 'MONOCHROME_PLATINUM', ThemeColors> = {
  // Current active theme
  ELECTRIC_BLUE: {
    background: '#0F172A',         // Slate 900
    surface: '#1E293B',            // Slate 800
    surfaceSecondary: '#0B1120',   // Slate 950
    border: '#334155',             // Slate 700
    borderHighlight: '#3B82F6',    // Blue 500
    primary: '#0284C7',            // Sky 600
    accent: '#38BDF8',             // Sky 400
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },

  // Future ready theme: Monochrome Platinum & Jet Black
  MONOCHROME_PLATINUM: {
    background: '#000000',         // True Jet Black
    surface: '#0D0D0E',            // Carbon Black
    surfaceSecondary: '#18181B',   // Zinc 900
    border: '#27272A',             // Zinc 800
    borderHighlight: '#52525B',    // Zinc 600
    primary: '#FFFFFF',            // Crisp White
    accent: '#E4E4E7',             // Platinum Zinc 200
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
  },
};

export const ACTIVE_THEME = THEME_PRESETS.ELECTRIC_BLUE;
