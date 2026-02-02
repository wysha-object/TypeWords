<script setup lang="ts">
import {nextTick, onMounted, watch} from "vue";

interface IProps {
  modelValue?: boolean,
  width?: string
}

let props = withDefaults(defineProps<IProps>(), {
  modelValue: true,
  width: '180rem'
})
const initialStyle = { top: '2.4rem', bottom: 'unset' as string }
let modalRef = $ref<HTMLElement | null>(null)
let style = $ref<Record<string, string>>({ ...initialStyle })

function applyPosition() {
  if (!modalRef) return
  const modal = modalRef as HTMLElement
  const rect = modal.getBoundingClientRect()
  const next: Record<string, string> = { ...initialStyle }

  // 垂直：若底部超出视口则贴底
  if (rect.bottom > window.innerHeight) {
    next.top = 'unset'
    next.bottom = '2.5rem'
  } else {
    next.top = initialStyle.top
    next.bottom = initialStyle.bottom
  }

  // 水平：若右侧超出则贴右；若左侧超出则贴左
  if (rect.right > window.innerWidth) {
    next.left = 'unset'
    next.right = '1rem'
    next.transform = 'none'
  } else if (rect.left < 0) {
    next.left = '1rem'
    next.right = 'unset'
    next.transform = 'none'
  } else {
    next.left = '50%'
    next.right = 'unset'
    next.transform = 'translateX(-50%)'
  }

  style = next
}

function schedulePosition() {
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(applyPosition)
    })
  })
}

watch(() => props.modelValue, (n) => {
  if (n) {
    style = { ...initialStyle }
    schedulePosition()
  } else {
    style = { ...initialStyle }
  }
})

onMounted(() => {
  if (props.modelValue) schedulePosition()
})
</script>

<template>
    <div v-if="modelValue" ref="modalRef" class="mini-modal" :style="{width, ...style}">
      <slot></slot>
    </div>
</template>

<style lang="scss">
.mini-row-title {
  @apply text-center text-base font-bold mb-2;
  color: var(--color-font-1);
}

.mini-row {
  @apply min-h-10 flex justify-between items-center gap-space text-base text-font-1 word-break-keep-all;
  color: var(--color-font-1);
}

.mini-modal {
  background: var(--color-card-bg);
  padding: var(--space) 1rem;
  @apply z-9 absolute left-1/2 transform -translate-x-1/2 shadow-lg rounded-xl w-50;
}
</style>
