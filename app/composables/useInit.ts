import { useBaseStore } from '~/stores/base.ts'
import { useRuntimeStore } from '~/stores/runtime.ts'
import { useSettingStore } from '~/stores/setting.ts'
import { syncSetting } from '~/apis'
import { get, set } from 'idb-keyval'
import { AppEnv, DictId } from '~/config/env.ts'

export function useInit() {
  const store = useBaseStore()
  const runtimeStore = useRuntimeStore()
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  let lastAudioFileIdList = []
  let isInitializing = true // 标记是否正在初始化
  watch(store.$state, (n: BaseState) => {
    console.log('store.$state', store.$state)
    // 如果正在初始化，不保存数据，避免覆盖
    if (isInitializing) return
    let data = shakeCommonDict(n)
    set(SAVE_DICT_KEY.key, JSON.stringify({ val: data, version: SAVE_DICT_KEY.version }))

    //筛选自定义和收藏
    let bookList = data.article.bookList.filter(v => v.custom || [DictId.articleCollect].includes(v.id))
    let audioFileIdList = []
    bookList.forEach(v => {
      //筛选 audioFileId 字体有值的
      v.articles
        .filter(s => !s.audioSrc && s.audioFileId)
        .forEach(a => {
          //所有 id 存起来，下次直接判断字符串是否相等，因为这个watch会频繁调用
          audioFileIdList.push(a.audioFileId)
        })
    })
    if (audioFileIdList.toString() !== lastAudioFileIdList.toString()) {
      let result = []
      //删除未使用到的文件
      get(LOCAL_FILE_KEY).then((fileList: Array<{ id: string; file: Blob }>) => {
        if (fileList && fileList.length > 0) {
          audioFileIdList.forEach(a => {
            let item = fileList.find(b => b.id === a)
            item && result.push(item)
          })
          set(LOCAL_FILE_KEY, result)
          lastAudioFileIdList = audioFileIdList
        }
      })
    }
  })

  watch(
    () => settingStore.$state,
    n => {
      if (isInitializing) return
      set(SAVE_SETTING_KEY.key, JSON.stringify({ val: n, version: SAVE_SETTING_KEY.version }))
      if (AppEnv.CAN_REQUEST) {
        syncSetting(null, settingStore.$state)
      }
    },
    { deep: true }
  )

  async function init() {
    console.log('init')
    isInitializing = true // 开始初始化
    await userStore.init()
    await store.init()
    await settingStore.init()
    store.load = true
    isInitializing = false // 初始化完成，允许保存数据

    if (settingStore.first) {
      set(APP_VERSION.key, APP_VERSION.version)
    } else {
      get(APP_VERSION.key).then(r => {
        runtimeStore.isNew = r ? APP_VERSION.version > Number(r) : true
      })
    }
    window.umami?.track('host', { host: window.location.host })
  }

  return init
}
