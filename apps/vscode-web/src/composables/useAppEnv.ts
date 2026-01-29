// // AppEnv 组合式函数，用于在组件中获取应用环境状态
// export const useAppEnv = () => {
//   const staticEnv = useAppEnvStatic()
//   const ls = useClientLocalStorage()
//
//   // 只在客户端初始化 AppEnv
//   const appEnv = reactive({
//     TOKEN: '',
//     IS_OFFICIAL: false,
//     IS_LOGIN: false,
//     CAN_REQUEST: false,
//   })
//
//   if (import.meta.client) {
//     appEnv.TOKEN = ls.getItem('token') ?? ''
//     appEnv.IS_LOGIN = !!appEnv.TOKEN
//     appEnv.CAN_REQUEST = appEnv.IS_LOGIN && appEnv.IS_OFFICIAL
//   }
//
//   return {
//     ...staticEnv,
//     appEnv,
//   }
// }
//
// // 静态环境变量（不需要客户端检查）
// export const useAppEnvStatic = () => {
//   const config = useRuntimeConfig()
//
//   return {
//     API_BASE: config.public.apiBase || 'http://localhost/',
//     ORIGIN: config.public.origin || 'https://typewords.cc',
//     HOST: config.public.host || 'typewords.cc',
//     MODE: process.dev ? 'development' : 'production',
//     RESOURCE_PATH: `${config.public.apiBase || 'http://localhost/'}static`,
//   }
// }
//
