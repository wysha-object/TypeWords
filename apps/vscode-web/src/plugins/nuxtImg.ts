// src/plugins/nuxtImg.ts
import { App } from 'vue'
import NuxtImg from '../components/NuxtImg.vue'

export default {
  install(app: App) {
    app.component('NuxtImg', NuxtImg)  // 全局注册 NuxtImg 组件
  }
}
