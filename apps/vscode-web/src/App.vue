<script setup lang="ts">
import useTheme from '@/hooks/theme.ts'
import { useSettingStore } from '@/stores/setting.ts'
import { onMounted } from 'vue'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useInit } from '@/composables/useInit.ts'

const { setTheme } = useTheme()
const settingStore = useSettingStore()
const init = useInit()

onMounted(() => {
  init()
  setTheme(settingStore.theme)
})
</script>

<template>
  <router-view></router-view>
</template>

<style scoped lang="scss"></style>
