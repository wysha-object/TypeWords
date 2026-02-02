<script setup lang="ts">
import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()
defineProps<{
  panelLeft: string
}>()
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden justify-center relative">
    <div class="flex-1 overflow-hidden">
      <div class="overflow-auto h-full box-content">
        <slot name="practice"></slot>
      </div>
    </div>
    <div
      class="panel-wrap"
      :style="{ left: panelLeft }"
      :class="{ 'has-panel': settingStore.showPanel }"
      @click.self="settingStore.showPanel = false"
    >
      <slot name="panel"></slot>
    </div>
    <div class="shrink-0">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.panel-wrap {
  position: fixed;
  top: 0.8rem;
  z-index: 1;
  height: calc(100vh - 1.8rem);
}
</style>
