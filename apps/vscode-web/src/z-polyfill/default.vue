<script setup lang="ts">
import BaseIcon from '@/components/BaseIcon.vue'
import useTheme from '@/hooks/theme.ts'
import { useSettingStore } from '@/stores/setting.ts'
import { onMounted } from 'vue'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useInit } from '@/composables/useInit.ts'
import SettingMiniDialog from '@/z-polyfill/SettingMiniDialog.vue'

const { setTheme } = useTheme()
const settingStore = useSettingStore()
const init = useInit()

onMounted(() => {
  init()
  setTheme(settingStore.theme)
})

</script>

<template>
  <div class="bg-primary flex flex-col h-screen anim relative overflow-hidden">
    <div class="flex justify-between p-4">
      <div class="tab bg-black py-1 px-2 rounded-md">Content Security Policy violations</div>
      <div class="flex gap-space">
        <BaseIcon>
          <IconFluentAdd16Regular />
        </BaseIcon>
        <BaseIcon>
          <IconFluentAdd16Regular />
        </BaseIcon>
        <BaseIcon>
          <SettingMiniDialog />
        </BaseIcon>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<style scoped lang="scss">
</style>
