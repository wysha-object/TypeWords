import { createClient } from '@supabase/supabase-js'
import { Toast } from '#components'

export const SUPABASE_URL = 'supabase_url'
export const SUPABASE_KEY = 'supabase_key'

export class Supabase {
  static instance
  static supabaseUrl = ''
  static supabaseKey = ''

  static check() {
    this.supabaseUrl = localStorage.getItem(SUPABASE_URL)
    this.supabaseKey = localStorage.getItem(SUPABASE_KEY)
    return !!(this.supabaseKey && this.supabaseUrl)
  }

  static getInstance() {
    if (!Supabase.instance) {
      if (this.check()) {
        try {
          Supabase.instance = createClient(this.supabaseUrl, this.supabaseKey)
        }catch(e) {
          Toast.error(e.message)
        }
      } else {
        Supabase.instance = {
          from: () => {
            return {
              select: () => Promise.resolve({ data: [] }),
              upsert: () => Promise.resolve({ data: [] }),
            }
          },
        }
      }
    }
    return Supabase.instance
  }
}
