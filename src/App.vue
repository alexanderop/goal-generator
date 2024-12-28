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
import Modal from '@/components/ui/modal.vue'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useLocalStorage } from '@vueuse/core'
import html2canvas from 'html2canvas'
import { Download, Eye } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

const goals = useLocalStorage<Goal[]>('2025-goals', [])
const cardRef = ref<HTMLElement>()
const selectedTheme = useLocalStorage<ThemeColor>('2025-goals-theme', 'blue')
const selectedFont = useLocalStorage<FontFamily>('2025-goals-font', 'inter')
const authorName = useLocalStorage('2025-goals-author', '')
const customization = useLocalStorage<CardCustomization>('2025-goals-customization', {
  subtitle: 'Dreams → Reality',
})
const previewOpen = ref(false)

// Force dark mode on mount
onMounted(() => {
  document.documentElement.classList.add('dark')
})

function updateGoals(newGoals: Goal[]) {
  goals.value = newGoals
}

async function downloadImage() {
  if (!cardRef.value)
    return

  try {
    // Temporarily modify the card for capture
    const card = cardRef.value
    const originalStyle = card.style.cssText
    const content = card.querySelector('.card-content')
    const originalHeight = content?.style.maxHeight
    const originalOverflow = content?.style.overflow

    // Remove scroll and height constraints
    if (content) {
      content.style.maxHeight = 'none'
      content.style.overflow = 'visible'
      content.style.height = 'auto'
    }
    card.style.height = 'auto'
    card.style.maxHeight = 'none'
    card.style.minHeight = 'auto'
    card.style.width = '900px' // Fixed width for consistent capture

    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: 'hsl(222.2 84% 4.9%)',
      scale: 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: 900,
      height: card.offsetHeight,
      onclone: (clonedDoc) => {
        // Remove all height/scroll constraints from cloned element
        clonedElement.style.height = 'auto'
        clonedElement.style.maxHeight = 'none'
        clonedElement.style.minHeight = 'auto'
        clonedElement.style.overflow = 'visible'

        const style = document.createElement('style')
        style.textContent = `
          .theme-text-goal, 
          .theme-text-primary,
          .theme-text-muted,
          .theme-text-category {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8) !important;
          }
          .goal-item {
            background: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.75),
              rgba(0, 0, 0, 0.65)
            ) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            backdrop-filter: blur(8px) !important;
          }
          .theme-text-goal {
            color: rgba(255, 255, 255, 0.95) !important;
          }
          .theme-text-category {
            color: rgba(255, 255, 255, 0.8) !important;
          }
          .theme-text-primary {
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5) !important;
          }
          .theme-card > div[class*="bg-gradient-to-t"] {
            background: linear-gradient(
              to top,
              hsl(222.2 84% 4.9%) 10%,
              hsla(222.2 84% 4.9% / 0.85) 50%,
              hsla(222.2 84% 4.9% / 0.75) 100%
            ) !important;
          }
          /* Remove all fixed positioning and scrolling */
          .sticky {
            position: relative !important;
          }
          .card-content {
            max-height: none !important;
            overflow: visible !important;
            height: auto !important;
          }
          /* Adjust spacing for download */
          .category-container {
            margin-bottom: 2rem !important;
          }
          .goal-item {
            margin-bottom: 0.75rem !important;
          }
        `
        clonedDoc.head.appendChild(style)
      },
    })

    // Enhance the canvas after rendering
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.filter = 'contrast(1.1)'
    }

    const link = document.createElement('a')
    link.download = '2025-goals.png'
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()

    // Restore original styles
    if (content) {
      content.style.maxHeight = originalHeight || ''
      content.style.overflow = originalOverflow || ''
      content.style.height = ''
    }
    card.style.cssText = originalStyle
  }
  catch (error) {
    console.error('Error generating image:', error)
  }
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        customization.value.image = {
          url: e.target.result,
          position: customization.value.image?.position || 'background',
        }
      }
    }
    reader.readAsDataURL(file)
  }
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
            @addGoals="updateGoals"
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

              <!-- Image Upload Section -->
              <div class="space-y-4">
                <Label class="text-sm font-medium">Background Image (optional)</Label>
                <div class="grid gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    class="cursor-pointer"
                    @change="handleImageUpload"
                  />
                  <RadioGroup
                    v-if="customization.image"
                    v-model="customization.image.position"
                    class="grid grid-cols-3 gap-2"
                  >
                    <div>
                      <RadioGroupItem
                        id="top"
                        value="top"
                        class="peer sr-only"
                      />
                      <Label
                        for="top"
                        class="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <component :is="icons.ArrowUp" class="mb-2 h-4 w-4" />
                        <span class="text-xs">Top</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        id="background"
                        value="background"
                        class="peer sr-only"
                      />
                      <Label
                        for="background"
                        class="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <component :is="icons.Layout" class="mb-2 h-4 w-4" />
                        <span class="text-xs">Full</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        id="bottom"
                        value="bottom"
                        class="peer sr-only"
                      />
                      <Label
                        for="bottom"
                        class="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <component :is="icons.ArrowDown" class="mb-2 h-4 w-4" />
                        <span class="text-xs">Bottom</span>
                      </Label>
                    </div>
                  </RadioGroup>
                  <Button
                    v-if="customization.image"
                    variant="outline"
                    class="w-full"
                    @click="customization.image = undefined"
                  >
                    <component :is="icons.X" class="mr-2 h-4 w-4" />
                    Remove Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Preview Section -->
        <div class="space-y-4">
          <div v-if="goals.length > 0">
            <div ref="cardRef">
              <GoalCard
                :goals="goals"
                :theme="selectedTheme"
                :font="selectedFont"
                :author="authorName"
                :customization="customization"
              />
            </div>
            <div class="flex justify-center gap-4 mt-6">
              <!-- Preview button -->
              <Button
                variant="outline"
                class="gap-2"
                @click="previewOpen = true"
              >
                <Eye class="h-4 w-4" />
                Preview
              </Button>
              <!-- Existing download button -->
              <Button class="gap-2" @click="downloadImage">
                <Download class="h-4 w-4" />
                Download Image
              </Button>
            </div>

            <!-- Preview Modal -->
            <Modal
              v-model:open="previewOpen"
              title="Preview"
              description="Preview of your goals card"
            >
              <div class="relative w-full aspect-[3/4] max-h-[95vh] bg-background">
                <div class="absolute inset-0 overflow-auto custom-scrollbar p-4">
                  <GoalCard
                    :goals="goals"
                    :theme="selectedTheme"
                    :font="selectedFont"
                    :author="authorName"
                    :customization="customization"
                  />
                </div>
              </div>
            </Modal>
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
