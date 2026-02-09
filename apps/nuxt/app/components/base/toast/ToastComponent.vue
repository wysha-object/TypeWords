<template>
  <Transition name="message-fade" appear>
    <div
      v-if="visible"
      class="message"
      :class="{ [type]: true, shadow }"
      :style="style"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="message-content">
        <IconFluentCheckmarkCircle20Filled v-if="props.type === 'success'" class="message-icon" />
        <IconFluentErrorCircle20Filled v-if="props.type === 'warning'" class="message-icon" />
        <IconFluentErrorCircle20Filled v-if="props.type === 'info'" class="message-icon" />
        <IconFluentDismissCircle20Filled v-if="props.type === 'error'" class="message-icon" />
        <span class="message-text">{{ message }}</span>

        <div class="relative group">
          <div class="transition-all duration-300">
            <Close v-if="showClose" class="message-close" @click="close" />
          </div>
          <div
            v-if="confirm"
            class="flex gap-2 pt-3 absolute z-2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto"
          >
            <div class="whitespace-nowrap">不再显示</div>
            <Checkbox/>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  duration?: number
  showClose?: boolean
  shadow?: boolean
  confirm?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  showClose: false,
  shadow: true,
  confirm: false,
})

const emit = defineEmits(['close'])
const visible = ref(false)
let timer = null

const style = computed(() => ({
  // 移除offset，现在由容器管理位置
}))

const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(close, props.duration)
  }
}

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

const handleMouseEnter = () => {
  clearTimer()
}

const handleMouseLeave = () => {
  startTimer()
}

const close = () => {
  visible.value = false
  // 延迟发出close事件，等待动画完成
  setTimeout(() => {
    emit('close')
  }, 300) // 等待动画完成（0.3秒）
}

onMounted(() => {
  visible.value = true
  startTimer()
})

onBeforeUnmount(() => {
  clearTimer()
})

// 暴露方法给父组件
defineExpose({
  close,
  show: () => {
    visible.value = true
    startTimer()
  },
})
</script>

<style scoped lang="scss">
.message {
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
  pointer-events: auto;
  @apply rounded-md py-3 px-5 relative min-w-50 ;

  &.shadow{
    @apply shadow-xl;
  }

  &.success {
    background: #f0f9ff;
    border-color: #67c23a;
    color: #67c23a;
  }

  &.warning {
    background: #fdf6ec;
    border-color: #e6a23c;
    color: #e6a23c;
  }

  &.info {
    background: #f4f4f5;
    border-color: #c1c1c1;
    color: #909399;
  }

  &.error {
    background: #fef0f0;
    border-color: #f56c6c;
    color: #f56c6c;
  }
}

// 深色模式支持
html.dark {
  .message {
    background: var(--color-second);
    border-color: var(--color-item-border);
    color: var(--color-main-text);

    &.success {
      background: rgba(103, 194, 58, 0.1);
      border-color: #67c23a;
      color: #67c23a;
    }

    &.warning {
      background: rgba(230, 162, 60, 0.1);
      border-color: #e6a23c;
      color: #e6a23c;
    }

    &.info {
      background: rgba(144, 147, 153, 0.1);
      border-color: #909399;
      color: #909399;
    }

    &.error {
      background: rgba(245, 108, 108, 0.1);
      border-color: #f56c6c;
      color: #f56c6c;
    }
  }
}

.message-content {
  @apply flex items-center gap-2;
}

.message-text {
  @apply flex-1 lh-none;
}

.message-close {
  @apply ml-10 cp opacity-70 hover:opacity-100;
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(-40px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-40px);
}
</style>
