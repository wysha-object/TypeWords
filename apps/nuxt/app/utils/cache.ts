import type { PracticeData, TaskWords } from '@/types/types.ts'
import type { PracticeState } from '@/stores/practice.ts'

type CacheConfig = { key: string; version: number }

export const PRACTICE_WORD_CACHE: CacheConfig = {
  key: 'PracticeSaveWord',
  version: 1,
}
export const PRACTICE_ARTICLE_CACHE: CacheConfig = {
  key: 'PracticeSaveArticle',
  version: 1,
}

export type PracticeWordCache = {
  taskWords: TaskWords
  practiceData: PracticeData
  statStoreData: PracticeState
}

export type PracticeArticleCache = {
  practiceData: {
    sectionIndex: number
    sentenceIndex: number
    wordIndex: number
  }
  statStoreData: PracticeState
}

function getLocal<T>(config: CacheConfig): T | null {
  const d = localStorage.getItem(config.key)
  if (!d) return null
  try {
    const obj = JSON.parse(d)
    if (obj.version !== config.version) throw new Error('version mismatch')
    return obj.val as T
  } catch {
    localStorage.removeItem(config.key)
    return null
  }
}

function setLocal<T>(config: CacheConfig, val: T | null): void {
  if (val != null) {
    localStorage.setItem(config.key, JSON.stringify({ version: config.version, val }))
  } else {
    localStorage.removeItem(config.key)
  }
}

export function getPracticeWordCacheLocal(): PracticeWordCache | null {
  return getLocal<PracticeWordCache>(PRACTICE_WORD_CACHE)
}

export function setPracticeWordCacheLocal(cache: PracticeWordCache | null): void {
  setLocal(PRACTICE_WORD_CACHE, cache)
}

export function getPracticeArticleCacheLocal(): PracticeArticleCache | null {
  return getLocal<PracticeArticleCache>(PRACTICE_ARTICLE_CACHE)
}

export function setPracticeArticleCacheLocal(cache: PracticeArticleCache | null): void {
  setLocal(PRACTICE_ARTICLE_CACHE, cache)
}

/** @deprecated 使用 usePracticePersistence('word') 的 load/save/clear；兼容用 */
export function getPracticeWordCache(): PracticeWordCache | null {
  return getPracticeWordCacheLocal()
}

/** @deprecated 使用 usePracticePersistence('word') 的 save/clear；兼容用 */
export function setPracticeWordCache(cache: PracticeWordCache | null): void {
  setPracticeWordCacheLocal(cache)
}

/** @deprecated 使用 usePracticePersistence('article') 的 load/save/clear；兼容用 */
export function getPracticeArticleCache(): PracticeArticleCache | null {
  return getPracticeArticleCacheLocal()
}

/** @deprecated 使用 usePracticePersistence('article') 的 save/clear；兼容用 */
export function setPracticeArticleCache(cache: PracticeArticleCache | null): void {
  setPracticeArticleCacheLocal(cache)
}
