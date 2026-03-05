import type { PracticeArticleCache, PracticeWordCache } from '@/utils/cache'
import {
  getPracticeArticleCacheLocal,
  getPracticeWordCacheLocal,
  setPracticeArticleCacheLocal,
  setPracticeWordCacheLocal,
} from '@/utils/cache'
import { Supabase } from '@/utils/supabase'

const PRACTICE_TYPE_WORD = 'practice_word'
const PRACTICE_TYPE_ARTICLE = 'practice_article'

type PracticeKind = 'word' | 'article'

type RemoteRow = {
  data: PracticeWordCache | PracticeArticleCache | null
  updated_at?: string
}

function getType(kind: PracticeKind): string {
  return kind === 'word' ? PRACTICE_TYPE_WORD : PRACTICE_TYPE_ARTICLE
}

async function fetchFromSupabase(kind: PracticeKind): Promise<RemoteRow | null> {
  if (!Supabase.check()) return null
  const typeName = getType(kind)
  const { data } = await Supabase.getInstance()
    .from('typewords_data')
    .select('data, updated_at')
    .eq('type', typeName)
    .maybeSingle()
  return data as RemoteRow | null
}

export function usePracticeWordPersistence() {
  async function load(): Promise<PracticeWordCache | null> {
    const remote = await fetchFromSupabase('word')
    const local = getPracticeWordCacheLocal()

    if (remote?.data != null && typeof remote.data === 'object') {
      setPracticeWordCacheLocal(remote.data as PracticeWordCache)
      return remote.data as PracticeWordCache
    }
    return local
  }

  function save(data: PracticeWordCache | null): void {
    setPracticeWordCacheLocal(data)
    // 是的，这段代码有重复，Supabase.check() 其实每次都检查了，可以先判断 check，再 upsert，不用重复写 if/else。
    if (Supabase.check()) {
      const updated_at = new Date().toISOString()
      Supabase.getInstance()
        .from('typewords_data')
        .upsert(
          { type: PRACTICE_TYPE_WORD, data: data ?? null, updated_at },
          { onConflict: 'type' }
        )
        .then()
    }
  }

  function clear(): void {
    setPracticeWordCacheLocal(null)
    if (Supabase.check()) {
      const updated_at = new Date().toISOString()
      Supabase.getInstance()
        .from('typewords_data')
        .upsert({ type: PRACTICE_TYPE_WORD, data: null, updated_at }, { onConflict: 'type' })
        .then()
    }
  }

  async function refreshFromRemote(): Promise<PracticeWordCache | null> {
    const remote = await fetchFromSupabase('word')
    if (remote?.data != null && typeof remote.data === 'object') {
      setPracticeWordCacheLocal(remote.data as PracticeWordCache)
      return remote.data as PracticeWordCache
    }
    return getPracticeWordCacheLocal()
  }

  return { load, save, clear, refreshFromRemote }
}

export function usePracticeArticlePersistence() {
  async function load(): Promise<PracticeArticleCache | null> {
    const remote = await fetchFromSupabase('article')
    const local = getPracticeArticleCacheLocal()

    if (remote?.data != null && typeof remote.data === 'object') {
      setPracticeArticleCacheLocal(remote.data as PracticeArticleCache)
      return remote.data as PracticeArticleCache
    }
    return local
  }

  function save(data: PracticeArticleCache | null): void {
    setPracticeArticleCacheLocal(data)
    if (Supabase.check()) {
      const updated_at = new Date().toISOString()
      Supabase.getInstance()
        .from('typewords_data')
        .upsert({ type: PRACTICE_TYPE_ARTICLE, data: data ?? null , updated_at }, { onConflict: 'type' })
        .then()
    }
  }

  function clear(): void {
    setPracticeArticleCacheLocal(null)
    if (Supabase.check()) {
      const updated_at = new Date().toISOString()
      Supabase.getInstance()
        .from('typewords_data')
        .upsert({ type: PRACTICE_TYPE_ARTICLE, data: null, updated_at }, { onConflict: 'type' })
        .then()
    }
  }

  async function refreshFromRemote(): Promise<PracticeArticleCache | null> {
    const remote = await fetchFromSupabase('article')
    if (remote?.data != null && typeof remote.data === 'object') {
      setPracticeArticleCacheLocal(remote.data as PracticeArticleCache)
      return remote.data as PracticeArticleCache
    }
    return getPracticeArticleCacheLocal()
  }

  return { load, save, clear, refreshFromRemote }
}
