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
  <div class="bg-primary flex flex-col  box-border h-screen anim relative overflow-hidden">
    <div class="flex justify-between p-4">
      <div class="tab bg-[#20232a] color-white py-1 px-2 rounded-md font-bold">Content Security Policy violations</div>
      <div class="flex gap-space color-gray-500">
        <BaseIcon>
          <IconFluentAdd16Regular />
        </BaseIcon>
        <BaseIcon>
          <IconFluentClock20Regular />
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
