/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17150F',
    background: '#FFFFFF',
    backgroundElement: '#F6F4F0',
    backgroundSelected: '#FBF0E3',
    textSecondary: '#55504A',
    textMuted: '#696257',
    accent: '#9A5518',
    onAccent: '#FFFFFF',
    border: '#E3DFD8',
    borderStrong: '#938B80',
    danger: '#B3261E',
    hero: '#17150F',
    onHero: '#FFFFFF',
    onHeroSecondary: '#B5AEA3',
  },
  dark: {
    text: '#ffffff',
    background: '#17150F',
    backgroundElement: '#17150F',
    backgroundSelected: '#55504A',
    textSecondary: '#B5AEA3',
    textMuted: '#B5AEA3',
    accent: '#D18A45',
    onAccent: '#17150F',
    border: '#55504A',
    borderStrong: '#938B80',
    danger: '#F08A82',
    hero: '#17150F',
    onHero: '#FFFFFF',
    onHeroSecondary: '#B5AEA3',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  small: 12,
  three: 16,
  four: 24,
  five: 32,
  large: 48,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const LoginTypography = {
  body: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 22 },
  lead: { fontFamily: 'Manrope', fontSize: 17, lineHeight: 26 },
  title: { fontFamily: 'Manrope', fontSize: 34, lineHeight: 38, fontWeight: '800', letterSpacing: -0.85 },
  label: { fontFamily: 'Manrope', fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 0.88, textTransform: 'uppercase' },
  button: { fontFamily: 'Manrope', fontSize: 16, lineHeight: 22, fontWeight: '600' },
} as const;

export const Radius = { control: 6, panel: 10, card: 16, pill: 999 } as const;
export const ControlSize = { input: 44, primary: 52, touch: 44 } as const;
