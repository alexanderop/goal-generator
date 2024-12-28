export interface Goal {
  id: string
  text: string
  category: string
  completed: boolean
  progress?: {
    current: number
    total: number
    unit?: string
  }
}

export interface CardCustomization {
  image?: {
    url: string
    position: 'top' | 'bottom' | 'background'
  }
  subtitle?: string
}

export const UNCATEGORIZED = 'uncategorized'

export const CATEGORIES = {
  career: { icon: 'Briefcase', color: 'blue' },
  health: { icon: 'Heart', color: 'red' },
  personal: { icon: 'User', color: 'green' },
  financial: { icon: 'DollarSign', color: 'yellow' },
  [UNCATEGORIZED]: { icon: 'List', color: 'gray' },
} as const
