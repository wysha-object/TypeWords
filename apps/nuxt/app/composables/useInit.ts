import { useBaseStore } from '~/stores/base.ts'
import { useRuntimeStore } from '~/stores/runtime.ts'
import { useSettingStore } from '~/stores/setting.ts'
import { useUserStore } from '~/stores/user.ts'
import { syncSetting } from '~/apis'
import { get, set } from 'idb-keyval'
import { AppEnv, DictId } from '~/config/env.ts'
import { shakeCommonDict } from '@/utils/index.ts'
import { APP_VERSION, LOCAL_FILE_KEY, SAVE_DICT_KEY, SAVE_SETTING_KEY } from '@/config/env.ts'

let unsub = null
let unsub2 = null

export function useInit() {
  const store = useBaseStore()
  const settingStore = useSettingStore()
  const runtimeStore = useRuntimeStore()
  const userStore = useUserStore()
  let lastAudioFileIdList = []
  let isInitializing = true // 标记是否正在初始化

  //init 有可能重复执行，因为从老网站导了数据之后需要 init
  async function init() {
    unsub?.()
    //用 $subscribe 替代 watch
    unsub = store.$subscribe((mutation, n) => {
      // 如果正在初始化，不保存数据，避免覆盖
      if (isInitializing) return
      // console.log('store.$subscribe', mutation, n)
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

    unsub2?.()
    unsub2 = settingStore.$subscribe((mutation, state) => {
      if (isInitializing) return
      // console.log('settingStore.$subscribe', mutation, state)
      set(SAVE_SETTING_KEY.key, JSON.stringify({ val: state, version: SAVE_SETTING_KEY.version }))
      if (AppEnv.CAN_REQUEST) {
        syncSetting(null, settingStore.$state)
      }
    })

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
