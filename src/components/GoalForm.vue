<script setup lang="ts">
import type { Goal } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CATEGORIES, UNCATEGORIZED } from '@/types'
import { useLocalStorage } from '@vueuse/core'
import * as icons from 'lucide-vue-next'
import { onMounted, watch } from 'vue'

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

function parseGoals(input: string): Goal[] {
  const goals: Goal[] = []
  let currentCategory = UNCATEGORIZED

  const lines = input.split('\n').map(line => line.trim()).filter(Boolean)

  // Regex to match progress patterns like "read 5/30 books" or "run 3/10 km"
  const progressRegex = /^([^/]+?)\s*(\d+)\/(\d+)(?:\s+(\w+))?\s*$/

  for (const line of lines) {
    if (line.startsWith('#')) {
      currentCategory = line.slice(1).trim().toLowerCase()
    }
    else if (line.startsWith('-')) {
      const goalText = line.slice(1).trim()
      if (goalText) {
        const completed = goalText.endsWith('[x]')
        let cleanText = completed ? goalText.slice(0, -3).trim() : goalText
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

// Get icon component for each category
function getIconComponent(iconName: string) {
  return icons[iconName as keyof typeof icons]
}

const examples = {
  progress: '- Read 5/30 books',
  completed: '- Learn guitar [x]',
  category: '#health\n- Run 25/100 km\n- Meditate daily',
}
</script>

<template>
  <Card>
    <CardHeader class="pb-4">
      <CardTitle>Your Goals</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-6">
        <!-- Instructions -->
        <div class="space-y-4">
          <!-- Categories -->
          <div>
            <h3 class="text-sm font-medium mb-2">
              Available Categories
            </h3>
            <div class="grid grid-cols-2 gap-2">
              <div
                v-for="(config, category) in CATEGORIES"
                :key="category"
                class="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                @click="() => text += `\n\n#${category}\n- `"
              >
                <component
                  :is="getIconComponent(config.icon)"
                  class="h-4 w-4"
                  :class="`text-${config.color}-400`"
                />
                <span class="font-medium">#{{ category }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Tips -->
          <div>
            <h3 class="text-sm font-medium mb-2">
              Quick Tips
            </h3>
            <div class="grid gap-2">
              <div
                v-for="(example, type) in examples"
                :key="type"
                class="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer group"
                @click="() => text += `\n${example}`"
              >
                <div class="shrink-0">
                  <component
                    :is="type === 'progress' ? icons.BarChart2 : type === 'completed' ? icons.CheckCircle : icons.Hash"
                    class="h-4 w-4 text-muted-foreground"
                  />
                </div>
                <div class="flex-1">
                  <code class="text-xs font-mono">{{ example }}</code>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{
                      type === 'progress' ? 'Track numeric progress with X/Y format'
                      : type === 'completed' ? 'Mark completed goals with [x]'
                        : 'Group goals under categories with #category'
                    }}
                  </p>
                </div>
                <span class="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to add
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Text Area -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium">Your Goals</label>
            <button
              class="text-xs text-muted-foreground hover:text-primary transition-colors"
              @click="text = ''"
            >
              Clear all
            </button>
          </div>
          <Textarea
            v-model="text"
            placeholder="Start typing your goals..."
            class="min-h-[300px] font-mono"
          />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.font-mono {
  font-feature-settings: 'liga' 0;
}
</style>
