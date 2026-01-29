export const useClientStorage = async () => {
  if (import.meta.server) {
    return {
      get: async () => null,
      set: async () => {},
      remove: async () => {},
    }
  }
  const mod = await import('idb-keyval')
  const { get, set, del } = mod as any
  return { get, set, remove: del }
}

export const useClientLocalStorage = () => {
  if (import.meta.server) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    }
  }
  return localStorage
}

