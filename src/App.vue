<script setup lang="ts">
import type { CardCustomization, FontFamily, Goal, ThemeColor } from '@/types'
import FontSelect from '@/components/FontSelect.vue'
import GoalCard from '@/components/GoalCard.vue'
import GoalForm from '@/components/GoalForm.vue'
import ThemeSelect from '@/components/ThemeSelect.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useLocalStorage } from '@vueuse/core'
import { onMounted, ref } from 'vue'

const goals = useLocalStorage<Goal[]>('2025-goals', [])
const selectedTheme = useLocalStorage<ThemeColor>('2025-goals-theme', 'blue')
const selectedFont = useLocalStorage<FontFamily>('2025-goals-font', 'inter')
const authorName = useLocalStorage('2025-goals-author', '')
const customization = useLocalStorage<CardCustomization>('2025-goals-customization', {
  subtitle: 'Dreams → Reality',
})

// Force dark mode on mount
onMounted(() => {
  document.documentElement.classList.add('dark')
})

function updateGoals(newGoals: Goal[]) {
  goals.value = newGoals
}
</script>

<template>
  <main class="min-h-screen bg-background py-10">
    <div class="container">
      <div class="mb-8">
        <h1 class="text-4xl font-bold tracking-tight">
          2025 Goal Generator
        </h1>
        <p class="text-muted-foreground mt-2">
          Write your goals in plain text and see them transform into a beautiful vision board
        </p>
      </div>

      <div class="grid gap-8 lg:grid-cols-2">
        <!-- Form Section -->
        <div class="lg:sticky lg:top-10 lg:h-[calc(100vh-8rem)] lg:overflow-auto space-y-6">
          <GoalForm
            :initial-goals="goals"
            @add-goals="updateGoals"
          />

          <!-- Theme and Font Selection -->
          <Card>
            <CardHeader class="pb-4">
              <CardTitle>Customize Style</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="space-y-2">
                <label class="text-sm font-medium">Theme</label>
                <ThemeSelect v-model="selectedTheme" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Font</label>
                <FontSelect v-model="selectedFont" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium">Your Name (optional)</label>
                <Input
                  v-model="authorName"
                  placeholder="Enter your name or handle"
                />
              </div>

              <!-- Subtitle Input -->
              <div class="space-y-2">
                <label class="text-sm font-medium">Card Subtitle</label>
                <Input
                  v-model="customization.subtitle"
                  placeholder="Enter a subtitle for your card"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Preview Section -->
        <div class="space-y-4">
          <div v-if="goals.length > 0">
            <GoalCard
              :goals="goals"
              :theme="selectedTheme"
              :font="selectedFont"
              :author="authorName"
              :customization="customization"
            />
          </div>
          <div v-else class="flex h-[60vh] items-center justify-center rounded-lg border-2 border-dashed">
            <div class="text-center">
              <h3 class="text-lg font-medium">
                No goals yet
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                Start by writing your goals in the text editor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */
.lg\:overflow-auto::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.lg\:overflow-auto {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Force dark mode styles */
:root {
  color-scheme: dark;
}

/* Custom scrollbar for preview */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
