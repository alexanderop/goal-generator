<script setup lang="ts">
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { type ThemeColor, THEMES } from '@/types'

defineProps<{
  modelValue: ThemeColor
}>()

defineEmits<{
  'update:modelValue': [value: ThemeColor]
}>()
</script>

<template>
  <RadioGroup
    :model-value="modelValue"
    class="grid grid-cols-3 gap-2"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div
      v-for="(theme, key) in THEMES"
      :key="key"
    >
      <RadioGroupItem
        :id="key"
        :value="key"
        class="peer sr-only"
      />
      <label
        :for="key"
        class="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
      >
        <div class="w-8 h-8 rounded-full" :style="{ background: theme.primary }" />
        <span class="mt-1 text-xs">{{ theme.name }}</span>
      </label>
    </div>
  </RadioGroup>
</template>
