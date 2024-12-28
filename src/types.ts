export type GoalCategory =
  | 'career'
  | 'education'
  | 'health'
  | 'personal'
  | 'growth'
  | 'family'
  | 'financial'
  | 'creative'
  | 'travel'
  | 'social'
  | 'spiritual'
  | 'skills'

export interface Goal {
  id: string
  text: string
  category: string
  completed: boolean
}

export const DEFAULT_CATEGORY = {
  label: 'General Goals',
  icon: 'ListTodo',
  color: 'gray',
} as const

export const UNCATEGORIZED = 'general' as const

export const CATEGORIES = {
  career: {
    label: 'Career & Professional',
    icon: 'Briefcase',
    color: 'blue',
  },
  education: {
    label: 'Education & Learning',
    icon: 'GraduationCap',
    color: 'yellow',
  },
  health: {
    label: 'Health & Wellness',
    icon: 'Heart',
    color: 'red',
  },
  personal: {
    label: 'Personal Life',
    icon: 'User',
    color: 'purple',
  },
  growth: {
    label: 'Personal Growth',
    icon: 'Sprout',
    color: 'green',
  },
  family: {
    label: 'Family & Relationships',
    icon: 'Users',
    color: 'pink',
  },
  financial: {
    label: 'Financial Goals',
    icon: 'DollarSign',
    color: 'emerald',
  },
  creative: {
    label: 'Creative Projects',
    icon: 'Palette',
    color: 'orange',
  },
  travel: {
    label: 'Travel & Adventure',
    icon: 'Plane',
    color: 'sky',
  },
  social: {
    label: 'Social & Community',
    icon: 'Users2',
    color: 'indigo',
  },
  spiritual: {
    label: 'Spiritual & Mindfulness',
    icon: 'Lotus',
    color: 'violet',
  },
  skills: {
    label: 'Skills & Hobbies',
    icon: 'Trophy',
    color: 'amber',
  },
} as const

export type ThemeColor = 'blue' | 'purple' | 'rose' | 'green' | 'orange' | 'slate'

export interface Theme {
  name: string
  primary: string
  secondary: string
  accent: string
  gradientFrom: string
  gradientVia: string
  gradientTo: string
  glowColor: string
}

export const THEMES: Record<ThemeColor, Theme> = {
  blue: {
    name: 'Ocean Blue',
    primary: 'rgb(59, 130, 246)',
    secondary: 'rgb(37, 99, 235)',
    accent: 'rgb(147, 197, 253)',
    gradientFrom: '#111827',
    gradientVia: '#0f172a',
    gradientTo: '#020617',
    glowColor: 'rgba(120,119,198,0.3)',
  },
  purple: {
    name: 'Royal Purple',
    primary: 'rgb(147, 51, 234)',
    secondary: 'rgb(126, 34, 206)',
    accent: 'rgb(216, 180, 254)',
    gradientFrom: '#1a1033',
    gradientVia: '#0f0620',
    gradientTo: '#020205',
    glowColor: 'rgba(168,85,247,0.3)',
  },
  rose: {
    name: 'Rose Gold',
    primary: 'rgb(244, 63, 94)',
    secondary: 'rgb(225, 29, 72)',
    accent: 'rgb(251, 207, 232)',
    gradientFrom: '#1c1917',
    gradientVia: '#0c0a09',
    gradientTo: '#000000',
    glowColor: 'rgba(244,63,94,0.2)',
  },
  green: {
    name: 'Forest Green',
    primary: 'rgb(34, 197, 94)',
    secondary: 'rgb(22, 163, 74)',
    accent: 'rgb(187, 247, 208)',
    gradientFrom: '#14261c',
    gradientVia: '#0c1912',
    gradientTo: '#020604',
    glowColor: 'rgba(34,197,94,0.2)',
  },
  orange: {
    name: 'Sunset Orange',
    primary: 'rgb(249, 115, 22)',
    secondary: 'rgb(234, 88, 12)',
    accent: 'rgb(254, 215, 170)',
    gradientFrom: '#27150b',
    gradientVia: '#1c0f08',
    gradientTo: '#000000',
    glowColor: 'rgba(249,115,22,0.2)',
  },
  slate: {
    name: 'Minimal Slate',
    primary: 'rgb(148, 163, 184)',
    secondary: 'rgb(100, 116, 139)',
    accent: 'rgb(226, 232, 240)',
    gradientFrom: '#0f172a',
    gradientVia: '#020617',
    gradientTo: '#000000',
    glowColor: 'rgba(148,163,184,0.2)',
  },
} as const

export type FontFamily =
  | 'inter'
  | 'cal'
  | 'mono'
  | 'heading'
  | 'handwriting'

export interface Font {
  name: string
  family: string
  style: string
}

export const FONTS: Record<FontFamily, Font> = {
  inter: {
    name: 'Inter',
    family: 'Inter',
    style: 'font-sans',
  },
  cal: {
    name: 'Cal Sans',
    family: 'Cal Sans',
    style: 'font-cal',
  },
  mono: {
    name: 'Monospace',
    family: 'JetBrains Mono',
    style: 'font-mono',
  },
  heading: {
    name: 'Heading',
    family: 'Lexend',
    style: 'font-heading',
  },
  handwriting: {
    name: 'Handwriting',
    family: 'Caveat',
    style: 'font-handwriting',
  },
}

export function getCategoryConfig(category: string) {
  return CATEGORIES[category as keyof typeof CATEGORIES] || DEFAULT_CATEGORY
}
