<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type FontFamily, FONTS } from '@/types'

defineProps<{
  modelValue: FontFamily
}>()

defineEmits<{
  'update:modelValue': [value: FontFamily]
}>()
</script>

<template>
  <Select
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <SelectTrigger class="w-full">
      <SelectValue placeholder="Select font" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem
        v-for="(font, key) in FONTS"
        :key="key"
        :value="key"
      >
        <span :class="font.style">{{ font.name }}</span>
      </SelectItem>
    </SelectContent>
  </Select>
</template>
