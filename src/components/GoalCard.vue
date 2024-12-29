<script setup lang="ts">
import type { CardCustomization, FontFamily, Goal, ThemeColor } from '@/types'
import { CardContent, CardHeader } from '@/components/ui/card'
import { DEFAULT_CATEGORY, FONTS, getCategoryConfig, THEMES } from '@/types'
import * as icons from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  goals: Goal[]
  theme?: ThemeColor
  font?: FontFamily
  author?: string
  customization?: CardCustomization
}>()

const currentTheme = computed(() => THEMES[props.theme || 'blue'])
const currentFont = computed(() => FONTS[props.font || 'inter'])
const fontClass = computed(() => currentFont.value.style)

const textColors = computed(() => ({
  '--text-primary': getContrastColor(currentTheme.value.primary),
  '--text-secondary': getContrastColor(currentTheme.value.secondary),
  '--text-muted': adjustOpacity(getContrastColor(currentTheme.value.gradientFrom), 0.85),
  '--text-goal': '#ffffff',
  '--text-category': 'rgba(255, 255, 255, 0.8)',
}))

const cardStyle = computed(() => ({
  '--theme-primary': currentTheme.value.primary,
  '--theme-secondary': currentTheme.value.secondary,
  '--theme-accent': currentTheme.value.accent,
  '--theme-glow': currentTheme.value.glowColor,
  '--gradient-from': currentTheme.value.gradientFrom,
  '--gradient-via': currentTheme.value.gradientVia,
  '--gradient-to': currentTheme.value.gradientTo,
  '--card-bg': 'radial-gradient(ellipse at top right, var(--gradient-from), var(--gradient-via), var(--gradient-to)), hsl(222.2 84% 4.9%)',
  '--overlay-opacity': '0.65',
  '--text-shadow-color': 'rgba(0, 0, 0, 0.4)',
  ...textColors.value,
}))

const goalsByCategory = computed(() => {
  return props.goals.reduce((acc, goal) => {
    if (!acc[goal.category])
      acc[goal.category] = []
    acc[goal.category].push(goal)
    return acc
  }, {} as Record<string, Goal[]>)
})

function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#000000' : '#ffffff'
}

function adjustOpacity(color: string, opacity: number): string {
  return color === '#ffffff'
    ? `rgba(255, 255, 255, ${opacity})`
    : `rgba(0, 0, 0, ${opacity})`
}

// Import country flags from GoalForm to keep them in sync
const COUNTRY_FLAGS: Record<string, string> = {
  sweden: '🇸🇪',
  amsterdam: '🇳🇱',
  netherlands: '🇳🇱',
  japan: '🇯🇵',
  // ... (copy all the flags from GoalForm)
}

function getCountryFlag(text: string): string | null {
  for (const [country, flag] of Object.entries(COUNTRY_FLAGS)) {
    const regex = new RegExp(`\\b${country}\\b`, 'i')
    if (regex.test(text) && !text.includes(flag))
      return flag
  }
  return null
}

// Helper to safely get icon component
function getIconComponent(category: string, goalText?: string) {
  // First check if the category is an emoji
  if (isEmoji(category)) {
    return {
      render: () => category,
    }
  }

  // If it's a travel category and has a flag, return null (we'll use the flag)
  if (category === 'travel' && goalText && extractFlag(goalText).flag) {
    return null
  }

  // Otherwise use the default icon logic
  const config = getCategoryConfig(category)
  return icons[config.icon as keyof typeof icons] || icons[DEFAULT_CATEGORY.icon]
}

// Helper to get category color
function getCategoryColor(category: string) {
  const config = getCategoryConfig(category)
  return `text-${config.color}-400`
}

// Add progress stats
const progress = computed(() => {
  const total = props.goals.length
  const completed = props.goals.filter(g => g.completed).length
  const percentage = Math.round((completed / total) * 100)
  return { total, completed, percentage }
})

// Add computed property for card dimensions
const cardDimensions = computed(() => {
  const totalGoals = props.goals.length
  const categories = Object.keys(goalsByCategory.value).length

  // Dynamic height based on content
  if (totalGoals <= 6)
    return 'min-h-[600px]'
  if (totalGoals <= 12)
    return 'min-h-[700px]'
  return 'min-h-[800px]'
})

function getColumnCount(totalGoals: number) {
  // Determine optimal number of columns based on total goals
  if (totalGoals <= 4)
    return 1
  if (totalGoals <= 8)
    return 2
  return 3
}

const columns = computed(() => {
  const totalGoals = props.goals.length
  const columnCount = getColumnCount(totalGoals)
  const columns: Array<Array<{ goal: Goal, category: string }>> = Array.from({ length: columnCount }, () => [])
  let currentColumn = 0

  // Distribute goals evenly across columns
  Object.entries(goalsByCategory.value).forEach(([category, goals]) => {
    goals.forEach((goal) => {
      columns[currentColumn].push({
        goal: { ...goal },
        category,
      })
      currentColumn = (currentColumn + 1) % columnCount
    })
  })

  return columns
})

// Group goals by category within each column
const columnsByCategory = computed(() => {
  return columns.value.map((column) => {
    const grouped = column.reduce((acc, { goal, category }) => {
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(goal)
      return acc
    }, {} as Record<string, Goal[]>)
    return grouped
  })
})

// Clean text by removing flag emojis
function cleanTextFromFlags(text: string): string {
  return text.replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '').trim()
}

function extractFlag(text: string): { flag: string | null, cleanText: string } {
  const flagRegex = /^([\u{1F1E6}-\u{1F1FF}]{2})\s*(.+)$/u
  const match = text.match(flagRegex)
  if (match)
    return { flag: match[1], cleanText: match[2] }
  return { flag: null, cleanText: text }
}

// Add the isEmoji helper function
function isEmoji(str: string): boolean {
  const emojiRegex = /\p{Emoji}/u
  return emojiRegex.test(str)
}

function formatGoalText(goal: Goal): string {
  let text = goal.text

  // Remove priority markers from display text
  if (goal.priority === 'must' && text.startsWith('! ')) {
    text = text.slice(2)
  }
  else if (goal.priority === 'nice' && text.startsWith('~ ')) {
    text = text.slice(2)
  }

  // Handle travel category with flags
  if (goal.category === 'travel') {
    return extractFlag(text).cleanText
  }

  return text
}
</script>

<template>
  <div
    class="relative rounded-lg border theme-card w-full p-6 sm:p-8 lg:p-10"
    :class="[
      fontClass,
    ]"
    :style="cardStyle"
  >
    <!-- Enhanced decorative elements -->
    <div
      v-if="!props.customization?.image"
      class="absolute inset-0 pointer-events-none theme-glow opacity-60"
    />

    <!-- Enhanced background effects -->
    <div
      v-if="!props.customization?.image"
      class="absolute -top-24 -right-24 w-64 h-64 theme-circle-primary rounded-full blur-3xl animate-pulse-slow"
    />
    <div
      v-if="!props.customization?.image"
      class="absolute -bottom-32 -left-32 w-96 h-96 theme-circle-secondary rounded-full blur-3xl animate-pulse-slow delay-300"
    />
    <div
      v-if="!props.customization?.image"
      class="absolute top-1/4 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl"
    />
    <div
      v-if="!props.customization?.image"
      class="absolute bottom-1/4 right-1/3 w-24 h-24 bg-primary/5 rounded-full blur-2xl"
    />

    <CardHeader
      class="text-center space-y-6 pb-8 sticky -top-6 -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10 pt-6 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5"
    >
      <div class="space-y-4">
        <!-- Vision Board label -->
        <div class="relative">
          <div class="flex items-center justify-center gap-3">
            <div class="h-[1px] w-16 bg-gradient-to-r from-transparent to-theme-border" />
            <span
              class="theme-text-accent uppercase text-sm tracking-wider font-semibold px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/20"
            >
              Vision Board
            </span>
            <div class="h-[1px] w-16 bg-gradient-to-l from-transparent to-theme-border" />
          </div>
        </div>

        <!-- Title section -->
        <div class="space-y-2">
          <h2
            class="font-bold text-7xl tracking-tight theme-text-primary drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000"
          >
            2025 Goals
          </h2>
          <p
            class="theme-text-muted text-lg font-medium animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-200"
          >
            {{ props.customization?.subtitle || 'Dreams → Reality' }}
          </p>
        </div>

        <!-- Progress section -->
        <div
          class="flex items-center justify-center gap-6 mt-4 p-4 rounded-2xl backdrop-blur-sm progress-section animate-in fade-in duration-1000 delay-300"
        >
          <div class="text-sm theme-text-muted font-medium">
            {{ progress.completed }}/{{ progress.total }} completed
          </div>
          <div class="h-2.5 w-32 bg-gray-800/50 rounded-full overflow-hidden">
            <div
              class="h-full theme-progress-bar transition-all duration-500 rounded-full"
              :style="{ width: `${progress.percentage}%` }"
            />
          </div>
          <div class="text-sm theme-text-accent font-semibold">
            {{ progress.percentage }}%
          </div>
        </div>
      </div>
    </CardHeader>

    <CardContent
      class="relative z-10 overflow-y-auto max-h-[calc(100%-220px)] custom-scrollbar card-content"
    >
      <div
        class="grid gap-6 pb-6"
        :class="[
          columns.length === 1 ? 'grid-cols-1'
          : columns.length === 2 ? 'grid-cols-2'
            : 'grid-cols-3',
        ]"
      >
        <!-- Columns -->
        <div
          v-for="(categoryGroups, columnIndex) in columnsByCategory"
          :key="columnIndex"
        >
          <div
            v-for="(categoryGoals, category) in categoryGroups"
            :key="category"
            class="space-y-2"
          >
            <!-- Goals -->
            <div
              v-for="goal in categoryGoals"
              :key="goal.id"
              class="goal-item relative flex items-center pl-4 py-3 rounded-xl transition-all duration-300"
              :class="[
                { 'opacity-85': goal.completed },
                goal.priority === 'must' && 'border-l-4 border-primary',
                goal.priority === 'nice' && 'border-l-4 border-muted',
              ]"
            >
              <!-- Category Icon or Flag -->
              <div class="mr-3 flex items-center">
                <template v-if="goal.category === 'travel'">
                  <span
                    v-if="extractFlag(goal.text).flag"
                    class="text-base leading-none category-icon"
                    v-text="extractFlag(goal.text).flag"
                  />
                  <component
                    :is="getIconComponent(goal.category)"
                    v-else
                    class="w-4 h-4 shrink-0 category-icon"
                    :class="getCategoryColor(goal.category)"
                  />
                </template>
                <component
                  :is="getIconComponent(goal.category)"
                  v-else
                  class="w-4 h-4 shrink-0 category-icon"
                  :class="getCategoryColor(goal.category)"
                />
              </div>
              <div class="flex-1 min-w-0 mr-4">
                <span
                  class="theme-text-goal line-clamp-1"
                  :class="[
                    { 'line-through opacity-50': goal.completed },
                    goal.priority === 'must' && 'font-bold text-white',
                    goal.priority === 'nice' && 'text-white/80',
                    goal.priority === 'normal' && 'text-white/90',
                  ]"
                  v-text="formatGoalText(goal)"
                />
                <!-- Progress indicator -->
                <div
                  v-if="goal.progress"
                  class="flex items-center gap-2 text-sm theme-text-category shrink-0"
                  :class="[
                    goal.priority === 'must' && 'text-primary/90',
                    goal.priority === 'nice' && 'text-muted-foreground/80',
                  ]"
                >
                  <div
                    class="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden"
                    :class="[
                      goal.priority === 'must' && 'bg-primary/10',
                      goal.priority === 'nice' && 'bg-muted/10',
                    ]"
                  >
                    <div
                      class="h-full theme-progress-bar"
                      :style="{
                        width: `${(goal.progress.current / goal.progress.total) * 100}%`,
                      }"
                      :class="[
                        goal.priority === 'must' && '!opacity-100 !bg-primary',
                        goal.priority === 'nice' && '!opacity-80 !bg-muted-foreground',
                      ]"
                    />
                  </div>
                  <span
                    class="tabular-nums whitespace-nowrap"
                    :class="[
                      goal.priority === 'must' && 'text-primary/90',
                      goal.priority === 'nice' && 'text-muted-foreground/80',
                    ]"
                  >
                    {{ goal.progress.current }}/{{ goal.progress.total }}
                    <span v-if="goal.progress.unit">{{ goal.progress.unit }}</span>
                  </span>
                </div>
              </div>
              <div
                v-if="goal.completed"
                class="shrink-0 ml-2 text-emerald-500"
                :class="[
                  goal.priority === 'must' && 'text-emerald-400',
                  goal.priority === 'nice' && 'text-emerald-600',
                ]"
              >
                <component
                  :is="icons.CheckCircle2"
                  class="w-4 h-4 animate-in fade-in"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Author watermark -->
      <div
        v-if="props.author"
        class="absolute bottom-6 right-6 theme-text-category font-mono text-sm rounded-full z-30 animate-in fade-in duration-700 px-4 py-1.5 border shadow-lg shadow-black/20"
        :class="[
          hasBackgroundImage
            ? 'bg-black/50 backdrop-blur-xl border-white/10'
            : 'bg-black/30 backdrop-blur-md border-white/5',
        ]"
      >
        @{{ props.author }}
      </div>
    </CardContent>
  </div>
</template>

<style scoped>
.theme-card {
  background: var(--card-bg);
  min-height: calc(100vh - 200px);
  max-height: 900px;
  overflow: hidden;
}

.theme-glow {
  background: radial-gradient(circle 500px at 50% 200px, var(--theme-glow), transparent);
}

.theme-border {
  background: var(--theme-primary);
  opacity: 0.5;
}

.theme-circle-primary {
  background: var(--theme-primary);
  opacity: 0.1;
}

.theme-circle-secondary {
  background: var(--theme-secondary);
  opacity: 0.1;
}

.theme-text-primary {
  color: var(--text-primary);
  text-shadow:
    0 2px 4px var(--text-shadow-color),
    0 4px 8px var(--text-shadow-color);
}

.theme-text-secondary {
  color: var(--text-secondary);
}

.theme-text-muted {
  color: var(--text-muted);
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.6),
    0 2px 4px rgba(0, 0, 0, 0.4);
}

.theme-text-accent {
  color: var(--theme-accent);
}

.theme-text-goal {
  color: var(--text-goal);
  text-shadow:
    0 1px 3px var(--text-shadow-color),
    0 2px 6px var(--text-shadow-color);
  display: inline-block;
  max-width: 100%;
  word-break: break-word;
}

.theme-text-category {
  color: var(--text-category);
  text-shadow:
    0 1px 3px rgba(0, 0, 0, 0.7),
    0 2px 6px rgba(0, 0, 0, 0.5);
}

.theme-progress-bar {
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-accent));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  animation: shimmer 2s infinite linear;
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.category-container {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
  position: relative;
}

.category-container:nth-child(1) {
  animation-delay: 0.1s;
}
.category-container:nth-child(2) {
  animation-delay: 0.2s;
}
.category-container:nth-child(3) {
  animation-delay: 0.3s;
}
.category-container:nth-child(4) {
  animation-delay: 0.4s;
}

.category-icon {
  filter: drop-shadow(0 1px 2px var(--text-shadow-color));
  opacity: 0.95;
  transition: all 0.3s ease;
  transform: scale(1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Adjust flag emoji size and position */
.category-icon:not(svg) {
  font-size: 1.1rem;
  line-height: 1;
  margin-top: -1px;
  margin-left: -1px;
}

.category-container:hover .category-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px var(--text-shadow-color));
}

.goal-item {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 3rem;
  margin-bottom: 0.75rem;
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

.goal-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.15);
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, var(--overlay-opacity)),
    rgba(0, 0, 0, calc(var(--overlay-opacity) - 0.1))
  ) !important;
  backdrop-filter: blur(8px);
}

.goal-item:hover .category-icon {
  opacity: 1;
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px var(--text-shadow-color));
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.15;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.delay-300 {
  animation-delay: 300ms;
}

.animate-in {
  animation: fadeIn 0.3s ease-out;
}

:deep(.goal-item) {
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, var(--overlay-opacity)),
    rgba(0, 0, 0, calc(var(--overlay-opacity) - 0.1))
  ) !important;
  backdrop-filter: blur(8px);
}

/* Enhanced contrast for progress section */
.progress-section {
  background: rgba(0, 0, 0, var(--overlay-opacity)) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
}

/* Add responsive container queries if needed */
@container (min-width: 768px) {
  .goal-item {
    min-height: 3.5rem;
  }
}

/* Adjust spacing for larger goal sets */
@media (min-height: 800px) {
  .category-container {
    margin-bottom: 1.5rem;
  }
}

/* Customize scrollbar for the content */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Ensure proper spacing at the bottom of scrollable content */
.category-container:last-child {
  padding-bottom: 2rem;
}

/* Responsive adjustments */
@media (min-width: 1024px) {
  .theme-card {
    height: calc(100vh - 100px);
  }
}

/* Adjust column layout for download */
@media print {
  .grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  }
}

/* Add styles for category headers */
.category-header {
  position: relative;
  padding: 0.5rem 0;
}

/* Adjust spacing between category groups */
.space-y-6 > div:not(:last-child) {
  margin-bottom: 1.5rem;
}

/* Enhance category icon appearance */
.category-icon {
  filter: drop-shadow(0 1px 2px var(--text-shadow-color));
}

/* Adjust sticky header appearance */
:deep(.card-header) {
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease;
}

/* Adjust content spacing when header is sticky */
.card-content {
  scroll-padding-top: 220px;
  scrollbar-gutter: stable;
}

/* Add styles for priority indicators */
.goal-item {
  transition: all 0.3s ease;
}

.goal-item.border-l-4 {
  padding-left: 1.25rem;
}
</style>
