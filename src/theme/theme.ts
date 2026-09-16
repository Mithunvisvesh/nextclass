import React, { createContext, useContext } from 'react';

export interface AppThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceVariant: string; // Alias for surfaceSubtle
  surfaceHighlight: string;
  card: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textTertiary: string; // Alias for textMuted
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryText: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  override: string;
  overrideLight: string;
  tabBar: string;
  tabBarBorder: string;
  badgeBg: string;
}

export const lightTheme: AppThemeColors = {
  isDark: false,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceVariant: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',
  card: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textTertiary: '#64748B',
  primary: '#2563EB',      // Sapphire / Royal Cobalt Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primaryText: '#FFFFFF',
  success: '#059669',      // Emerald
  successLight: '#ECFDF5',
  warning: '#D97706',      // Warm Amber
  warningLight: '#FFFBEB',
  danger: '#DC2626',       // Crimson Red
  dangerLight: '#FEF2F2',
  info: '#0284C7',         // Sky Blue
  infoLight: '#F0F9FF',
  override: '#4F46E5',     // Indigo Accent
  overrideLight: '#EEF2FF',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  badgeBg: '#F1F5F9'
};

export const darkTheme: AppThemeColors = {
  isDark: true,
  background: '#0B0F19',  // Deep Midnight Slate
  surface: '#151E2E',     // Elevated Dark Card
  surfaceSubtle: '#1C2638',
  surfaceVariant: '#1C2638',
  surfaceHighlight: '#24324A',
  card: '#151E2E',
  border: '#24324A',
  borderSubtle: '#1A2332',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textTertiary: '#94A3B8',
  primary: '#3B82F6',      // Bright Cobalt Blue
  primaryDark: '#2563EB',
  primaryLight: '#172554',
  primaryText: '#FFFFFF',
  success: '#10B981',      // Vibrant Mint/Emerald
  successLight: '#064E3B',
  warning: '#F59E0B',      // Warm Gold/Amber
  warningLight: '#451A03',
  danger: '#EF4444',       // Crimson
  dangerLight: '#450A0A',
  info: '#38BDF8',         // Sky Blue
  infoLight: '#082F49',
  override: '#818CF8',     // Light Indigo
  overrideLight: '#1E1B4B',
  tabBar: '#111827',
  tabBarBorder: '#1F2937',
  badgeBg: '#1E293B'
};

export const ThemeContext = createContext<{ colors: AppThemeColors; isDark: boolean }>({
  colors: lightTheme,
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);
