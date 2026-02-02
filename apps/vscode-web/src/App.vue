<script setup lang="ts">
import { onMounted } from 'vue'
import { useBaseStore } from '@/stores/base'
import { useRuntimeStore } from '@/stores/runtime'
import { useSettingStore } from '@/stores/setting'
import useTheme from '@/hooks/theme.ts'
import { get, set } from 'idb-keyval'
import { APP_VERSION } from '@/config/env'
import { useUserStore } from '@/stores/user'

const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const settingStore = useSettingStore()
const userStore = useUserStore()
const { setTheme } = useTheme()

async function init() {
  setTheme(settingStore.theme)

  if (settingStore.first) {
    set(APP_VERSION.key, APP_VERSION.version)
  } else {
    get(APP_VERSION.key).then(r => {
      runtimeStore.isNew = r ? APP_VERSION.version > Number(r) : true
    })
  }
  window.umami?.track('host', { host: window.location.host })
}

onMounted(init)
</script>

<template>
  <router-view></router-view>
</template>
