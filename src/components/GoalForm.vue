<script setup lang="ts">
import type { Goal } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORIES, UNCATEGORIZED } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import * as icons from 'lucide-vue-next'
import { onMounted, watch, ref } from 'vue'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/modal.vue'
import { HelpCircle } from 'lucide-vue-next'

const props = defineProps<{
  initialGoals?: Goal[]
}>()

const emit = defineEmits<{
  'addGoals': [goals: Goal[]]
}>()

const text = useLocalStorage('2025-goals-text', '')

// Country flags mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'sweden': '🇸🇪',
  'amsterdam': '🇳🇱',
  'netherlands': '🇳🇱',
  'japan': '🇯🇵',
  'korea': '🇰🇷',
  'south korea': '🇰🇷',
  'france': '🇫🇷',
  'paris': '🇫🇷',
  'italy': '🇮🇹',
  'rome': '🇮🇹',
  'spain': '🇪🇸',
  'barcelona': '🇪🇸',
  'madrid': '🇪🇸',
  'germany': '🇩🇪',
  'berlin': '🇩🇪',
  'uk': '🇬🇧',
  'london': '🇬🇧',
  'england': '🇬🇧',
  'usa': '🇺🇸',
  'united states': '🇺🇸',
  'china': '🇨🇳',
  'australia': '🇦🇺',
  'canada': '🇨🇦',
  'brazil': '🇧🇷',
  'india': '🇮🇳',
  'singapore': '🇸🇬',
  'thailand': '🇹🇭',
  'bangkok': '🇹🇭',
  'vietnam': '🇻🇳',
  'dubai': '🇦🇪',
  'uae': '🇦🇪',
}

function addCountryFlag(text: string): string | null {
  // First check if the text already contains any country flag emoji
  const hasFlag = /[\u{1F1E6}-\u{1F1FF}]{2}/u.test(text)
  if (hasFlag) return null

  for (const [country, flag] of Object.entries(COUNTRY_FLAGS)) {
    const regex = new RegExp(`\\b${country}\\b`, 'i')
    if (regex.test(text))
      return flag
  }
  return null
}

// Add this function to check if a string is an emoji
function isEmoji(str: string): boolean {
  const emojiRegex = /\p{Emoji}/u
  return emojiRegex.test(str)
}

function parseGoals(input: string): Goal[] {
  const goals: Goal[] = []
  let currentCategory = UNCATEGORIZED

  const lines = input.split('\n').map(line => line.trim()).filter(Boolean)

  // Updated regex to handle priority markers
  const progressRegex = /^(?:!|~)?\s*([^/]+?)\s*(\d+)\/(\d+)(?:\s+(\w+))?\s*$/

  for (const line of lines) {
    if (line.startsWith('#')) {
      const categoryText = line.slice(1).trim()
      // If the category is an emoji, use it directly, otherwise convert to lowercase
      currentCategory = isEmoji(categoryText) ? categoryText : categoryText.toLowerCase()
    }
    else if (line.startsWith('-')) {
      const goalText = line.slice(1).trim()
      if (goalText) {
        const completed = goalText.endsWith('[x]')
        let cleanText = completed ? goalText.slice(0, -3).trim() : goalText
        let priority: 'must' | 'nice' | 'normal' = 'normal'

        // Check for priority markers first
        if (cleanText.startsWith('!')) {
          priority = 'must'
          cleanText = cleanText.slice(1).trim()
        }
        else if (cleanText.startsWith('~')) {
          priority = 'nice'
          cleanText = cleanText.slice(1).trim()
        }

        let progress

        // Check for progress pattern
        const progressMatch = cleanText.match(progressRegex)
        if (progressMatch) {
          const [_, text, current, total, unit] = progressMatch
          cleanText = text.trim()
          progress = {
            current: Number.parseInt(current),
            total: Number.parseInt(total),
            unit,
          }
        }

        // Only add flag if it's in the travel category
        if (currentCategory === 'travel') {
          const flag = addCountryFlag(cleanText)
          if (flag && !cleanText.includes(flag)) {
            cleanText = `${flag} ${cleanText}`
          }
        }

        goals.push({
          id: crypto.randomUUID(),
          text: cleanText,
          category: currentCategory,
          completed,
          priority,
          progress,
        })
      }
    }
  }

  return goals
}

// Initialize text from props.initialGoals if provided
onMounted(() => {
  if (props.initialGoals?.length) {
    const textLines: string[] = []
    let currentCategory = ''

    props.initialGoals.forEach((goal) => {
      if (goal.category !== currentCategory) {
        currentCategory = goal.category
        textLines.push(`\n#${currentCategory}`)
      }
      let goalText = `- ${goal.text}`
      if (goal.progress) {
        goalText += ` ${goal.progress.current}/${goal.progress.total}`
        if (goal.progress.unit)
          goalText += ` ${goal.progress.unit}`
      }
      if (goal.completed)
        goalText += ' [x]'
      textLines.push(goalText)
    })

    text.value = textLines.join('\n').trim()
  }
})

// Watch for text changes and emit new goals
watch(text, (newText) => {
  const goals = parseGoals(newText)
  emit('addGoals', goals)
}, { immediate: true })

// Update the getIconComponent function to handle emoji categories
function getIconComponent(category: string) {
  if (isEmoji(category)) {
    // For emoji categories, return a component that just renders the emoji
    return {
      render: () => category,
    }
  }
  // For regular categories, use the existing icon lookup
  const iconName = CATEGORIES[category as keyof typeof CATEGORIES]?.icon || DEFAULT_CATEGORY.icon
  return icons[iconName as keyof typeof icons]
}

const examples = {
  progress: '- Read 5/30 books',
  completed: '- Learn guitar [x]',
  category: '#health\n- Run 25/100 km\n- Meditate daily',
}

// Add ref for modal state
const showHelp = ref(false)

// Add help content
const helpSections = [
  {
    title: '✨ Getting Started',
    items: [
      'Type your goals in the text area below',
      'Each goal starts with a "-" (dash)',
      'Goals are automatically organized into categories',
    ],
  },
  {
    title: '🎯 Goal Features',
    items: [
      'Mark goals as complete by adding [x] at the end',
      'Track progress like "5/30 books" or "25/100 km"',
      'Travel goals automatically get country flags 🌎',
    ],
  },
  {
    title: '📝 Categories',
    items: [
      'Click on any category button to quickly add it',
      'Create custom categories with emojis (#🎮, #🎨)',
      'Goals without categories go to "General"',
    ],
  },
  {
    title: '💡 Example Goals',
    code: `#health
- Run 25/100 km
- Meditate daily [x]
- Drink more water

#🎮 Gaming
- Complete Zelda
- Reach Diamond rank 5/10 wins

#travel
- Visit Sweden
- Explore Japan with friends

#career
- Get promoted to senior role
- Learn 3/5 new technologies`,
  },
  {
    title: '⭐ Goal Priority',
    items: [
      'Add ! before goal text for "Must Achieve" goals',
      'Add ~ before goal text for "Nice to Have" goals',
      'No symbol means normal priority',
    ],
    code: `#career
- ! Get promoted to senior role
- ~ Learn Rust programming
- Continue current projects`
  },
]

// Add quick templates for common goals
const quickTemplates = [
  {
    icon: 'Dumbbell',
    label: 'Fitness Goal',
    template: '#health\n- ! Exercise 3/7 days per week\n- Run 0/100 km this year\n- ~ Try yoga',
  },
  {
    icon: 'BookOpen',
    label: 'Reading Goal',
    template: '#education\n- ! Read 0/24 books this year\n- Study 30 mins daily\n- ~ Join a book club',
  },
  {
    icon: 'Plane',
    label: 'Travel Goal',
    template: '#travel\n- ! Visit Japan\n- ~ Explore Europe\n- Learn basic Japanese',
  },
  {
    icon: 'Brain',
    label: 'Learning Goal',
    template: '#skills\n- ! Learn a new language\n- Master 0/3 new skills\n- ~ Start a side project',
  },
]
</script>

<template>
  <Card>
    <CardHeader class="pb-4">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <CardTitle>Your Goals</CardTitle>
          <p class="text-sm text-muted-foreground">
            Write your goals and see them transform into a beautiful vision board
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          @click="showHelp = true"
        >
          <HelpCircle class="h-5 w-5" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-6">
        <!-- Quick Start Templates -->
        <div>
          <h3 class="text-sm font-medium mb-3">
            Quick Start Templates
          </h3>
          <div class="grid grid-cols-2 gap-2">
            <Button
              v-for="template in quickTemplates"
              :key="template.label"
              variant="outline"
              class="h-auto py-3 px-4 justify-start"
              @click="text += (text ? '\n\n' : '') + template.template"
            >
              <component
                :is="icons[template.icon as keyof typeof icons]"
                class="mr-2 h-4 w-4"
              />
              {{ template.label }}
            </Button>
          </div>
        </div>

        <!-- Categories -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-medium">
              Categories
            </h3>
            <span class="text-xs text-muted-foreground">
              Click to add
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div
              v-for="(config, category) in CATEGORIES"
              :key="category"
              class="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group"
              @click="() => text += `\n\n#${category}\n- `"
            >
              <component
                :is="getIconComponent(category)"
                class="h-4 w-4"
                :class="[!isEmoji(category) && `text-${config.color}-400`]"
              />
              <span class="font-medium flex-1">#{{ category }}</span>
              <span class="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Add
              </span>
            </div>
            <!-- Custom emoji category -->
            <div
              class="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group"
              @click="() => text += '\n\n#🎯\n- '"
            >
              <span class="text-base">🎯</span>
              <span class="font-medium flex-1">Custom</span>
              <span class="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Add
              </span>
            </div>
          </div>
        </div>

        <!-- Text Area with Enhanced Label -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="space-y-1">
              <label class="text-sm font-medium">Write Your Goals</label>
              <p class="text-xs text-muted-foreground">
                Start with "-" for goals, "#" for categories
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="h-8"
              @click="text = ''"
            >
              Clear all
            </Button>
          </div>
          <Textarea
            v-model="text"
            placeholder="Example:
#career
- ! Get promoted to senior role
- Learn new technologies 2/5
- ~ Learn a new programming language

#health
- ! Exercise 3 times per week
- ~ Try meditation
- Drink more water [x]"
            class="min-h-[300px] font-mono"
          />
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Enhanced Help Modal -->
  <Modal
    v-model:open="showHelp"
    title="How to Use the Goal Generator"
    description="Create and organize your 2025 goals easily"
  >
    <div class="max-w-2xl mx-auto p-6 space-y-8">
      <!-- Help Sections -->
      <div class="space-y-6">
        <div
          v-for="section in helpSections"
          :key="section.title"
          class="space-y-3"
        >
          <h3 class="text-lg font-semibold flex items-center gap-2">
            {{ section.title }}
          </h3>
          <ul
            v-if="section.items"
            class="space-y-2 list-disc list-inside text-muted-foreground"
          >
            <li
              v-for="item in section.items"
              :key="item"
              class="flex gap-2 items-start"
            >
              <span class="select-none">•</span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <div
            v-if="section.code"
            class="bg-muted/50 rounded-lg p-4"
          >
            <pre class="text-sm font-mono whitespace-pre-wrap">{{ section.code }}</pre>
          </div>
        </div>
      </div>

      <!-- Try It Button -->
      <div class="flex justify-end gap-3">
        <Button
          variant="outline"
          @click="showHelp = false"
        >
          Got it
        </Button>
        <Button
          @click="() => {
            text = helpSections[3].code
            showHelp = false
          }"
        >
          Try Example Goals
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.font-mono {
  font-feature-settings: 'liga' 0;
}

/* Add smooth transition for modal */
:deep(.dialog-content) {
  transition: transform 0.2s ease-out;
}
</style>
