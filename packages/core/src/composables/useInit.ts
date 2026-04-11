import { APP_VERSION, AppEnv } from '../config/env'
import { debounce } from '../utils'
import { syncSetting } from '../apis'
import { useBaseStore, useRuntimeStore, useSettingStore, useUserStore } from '../stores'
import { Supabase } from '../utils/supabase'
import { ensureHashGuardBeforeInit, useDataSyncPersistence } from './useDataSyncPersistence'

let unsub = null
let unsub2 = null

export function useInit() {
  const store = useBaseStore()
  const settingStore = useSettingStore()
  const runtimeStore = useRuntimeStore()
  const userStore = useUserStore()
  const dataSync = useDataSyncPersistence()
  let isInitializing = true // 标记是否正在初始化

  const onvisibilitychange = async () => {
    //如果标签页失活了就不保存数据了
    if (document.hidden) {
      isInitializing = true
    } else {
      //当激活时，要先获取数据，以保证本地是最新的，以免本地老数据上传到后端覆盖新数据
      isInitializing = true
      await dataSync.pullRemoteIfNewer(['setting', 'dict'])
      store.load = true
      settingStore.load = true
      isInitializing = false
    }
  }

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onvisibilitychange)
  })

  //init 有可能重复执行，因为从老网站导了数据之后需要 init
  async function init() {
    document.removeEventListener('visibilitychange', onvisibilitychange)
    document.addEventListener('visibilitychange', onvisibilitychange)

    unsub?.()
    //用 $subscribe 替代 watch
    unsub = store.$subscribe(
      debounce(async (mutation, n) => {
        // 如果正在初始化，不保存数据，避免覆盖
        if (isInitializing || runtimeStore.globalLoading) return
        console.log('store.$subscribe', mutation, n)
        isInitializing = true
        try {
          await dataSync.saveDictState(n)
        } finally {
          isInitializing = false
        }
      }, 1000)
    )

    unsub2?.()
    unsub2 = settingStore.$subscribe(
      debounce(async (mutation, data) => {
        if (isInitializing || runtimeStore.globalLoading) return
        // console.log('settingStore.$subscribe', mutation, state, isInitializing)

        isInitializing = true
        try {
          await dataSync.saveLocalAndSync('setting', data)
        } finally {
          isInitializing = false
        }
        if (AppEnv.CAN_REQUEST) {
          syncSetting(null, settingStore.$state)
        }
      }, 1000)
    )

    console.time('init')
    await ensureHashGuardBeforeInit()
    await userStore.init()
    await store.init()
    await settingStore.init()
    await dataSync.pullRemoteIfNewer(['setting', 'dict'])
    console.timeEnd('init')
    store.load = true
    isInitializing = false // 初始化完成，允许保存数据

    runtimeStore.isNew = APP_VERSION.version > Number(settingStore.webAppVersion)
    runtimeStore.isError = Supabase.getStatus().status === 'error'
    window.umami?.track('host', { host: window.location.host })
  }

  return init
}
