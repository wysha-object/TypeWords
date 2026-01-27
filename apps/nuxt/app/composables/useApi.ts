// export const useApi = () => {
//   const config = useRuntimeConfig()
//   const route = useRoute()
//
//   // 正确获取 userStore（在客户端时）
//   const getUserStore = () => {
//     if (import.meta.server) return null
//     try {
//       const { useUserStore } = require('../stores/user')
//       return useUserStore()
//     } catch (e) {
//       // 如果 store 未初始化，返回 null
//       return null
//     }
//   }
//
//   const apiFetch = async <T>(url: string, options: any = {}): Promise<{ success: boolean; data?: T; msg?: string }> => {
//     try {
//       // 在请求时获取 token（因为可能在初始化后才有）
//       const userStore = getUserStore()
//       const token = userStore?.token || ''
//
//       const response = await $fetch(url, {
//         baseURL: config.public.apiBase,
//         headers: {
//           ...options.headers,
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         ...options,
//       })
//       return { success: true, data: response as T }
//     } catch (error: any) {
//       if (error?.status === 401 && import.meta.client) {
//         try {
//           const userStore = getUserStore()
//           if (userStore?.logout) {
//             userStore.logout()
//           }
//           const returnTo = encodeURIComponent(route.fullPath || '/')
//           await navigateTo(`/user/login?returnTo=${returnTo}`)
//         } catch (e) {
//           console.error('Logout error:', e)
//         }
//       }
//       return { success: false, msg: error?.message || '请求失败' }
//     }
//   }
//
//   return { apiFetch }
// }
