import { APP_VERSION, AppEnv } from '../config/env'
import { debounce } from '../utils'
import { syncSetting } from '../apis'
import { useBaseStore, useRuntimeStore, useSettingStore, useUserStore } from '../stores'
import { Supabase } from '../utils/supabase'
import { ensureHashGuardBeforeInit, useDataSyncPersistence } from './useDataSyncPersistence'
import { SyncDataType } from '../types'

let unsub = null
let unsub2 = null

export function useInit() {
  const store = useBaseStore()
  const settingStore = useSettingStore()
  const runtimeStore = useRuntimeStore()
  const userStore = useUserStore()
  const dataSync = useDataSyncPersistence()
  let initializing = false // 标记是否正在初始化
  let focus = true
  let fetching = false

  const onvisibilitychange = async () => {
    //如果标签页失活了就不保存数据了
    if (document.hidden) {
      focus = false
    } else {
      try {
        focus = true
        //当激活时，要先获取数据，以保证本地是最新的，以免本地老数据上传到后端覆盖新数据
        if (fetching) return
        fetching = true
        await dataSync.syncData(
          { [SyncDataType.dict]: null, [SyncDataType.setting]: null },
          //只拉不推送
          { pushWhenLocalNewer: false }
        )
      } finally {
        fetching = false
      }
    }
  }

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', onvisibilitychange)
  })

  //init 有可能重复执行，因为从老网站导了数据之后需要 init
  async function init() {
    if (initializing) return
    initializing = true
    console.time('init')

    //先清理副作用，避免重复监听
    unsub?.()
    unsub2?.()
    document.removeEventListener('visibilitychange', onvisibilitychange)

    await ensureHashGuardBeforeInit()
    await userStore.init()
    let dictData = await store.init()
    let settingData = await settingStore.init()
    if (dictData && settingData) {
      await dataSync.syncData({
        [SyncDataType.dict]: dictData,
        [SyncDataType.setting]: settingData,
      })
    }
    store.load = true
    console.timeEnd('init')
    initializing = false // 初始化完成，允许保存数据

    //等数据全部准备好，再开启监听，避免循环保存-同步
    document.addEventListener('visibilitychange', onvisibilitychange)
    //用 $subscribe 替代 watch
    unsub = store.$subscribe(
      debounce(async (mutation, n) => {
        // 如果正在初始化，不保存数据，避免覆盖
        if (fetching || !focus || runtimeStore.globalLoading) return
        console.log('store.$subscribe', mutation, n)
        fetching = true
        try {
          await dataSync.saveDictState(n)
        } finally {
          fetching = false
        }
      }, 1000)
    )

    unsub2 = settingStore.$subscribe(
      debounce(async (mutation, data) => {
        if (fetching || !focus || runtimeStore.globalLoading) return
        console.log('settingStore.$subscribe', mutation, data)
        fetching = true
        try {
          await dataSync.saveLocalAndSync(SyncDataType.setting, data)
        } finally {
          fetching = false
        }
        if (AppEnv.CAN_REQUEST) {
          syncSetting(null, settingStore.$state)
        }
      }, 1000)
    )

    runtimeStore.isNew = APP_VERSION.version > Number(settingStore.webAppVersion)
    runtimeStore.isError = Supabase.getStatus().status === 'error'
    window.umami?.track('host', { host: window.location.host })
  }

  return init
}
