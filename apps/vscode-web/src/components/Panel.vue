<script setup lang="ts">
import {computed, provide} from "vue"
import {useSettingStore} from "@/stores/setting";
import Close from "@/components/icon/Close.vue";
import Tooltip from "@/components/base/Tooltip.vue";
import {ShortcutKey} from "@/types/enum";

const settingStore = useSettingStore()
let tabIndex = $ref(0)
provide('tabIndex', computed(() => tabIndex))


</script>
<template>
  <Transition name="fade">
    <div class="panel anim" v-bind="$attrs" v-show="settingStore.showPanel">
      <header class="flex justify-between items-center py-3 px-space">
        <div class="color-main">
          <slot name="title"></slot>
        </div>
        <Tooltip
            :title="`${$t('close')}(${settingStore.shortcutKeyMap[ShortcutKey.TogglePanel]})`"
        >
          <Close @click="settingStore.showPanel = false"/>
        </Tooltip>
      </header>
      <div class="flex-1 overflow-auto">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>
<style scoped lang="scss">
.panel {
  width: var(--panel-width);
  background: var(--color-second);
  @apply shadow-lg flex flex-col h-full rounded-xl;
}
</style>
