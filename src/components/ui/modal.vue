<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

defineProps<{
  open: boolean
  title?: string
  description?: string
}>()

defineEmits<{
  'update:open': [value: boolean]
}>()
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[95vw] sm:max-h-[95vh] p-0 bg-background border">
      <DialogTitle v-if="title" class="sr-only">
        {{ title }}
      </DialogTitle>
      <DialogDescription v-if="description" class="sr-only">
        {{ description }}
      </DialogDescription>
      <slot />
    </DialogContent>
  </Dialog>
</template>
