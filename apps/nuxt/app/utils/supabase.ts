import { createClient } from '@supabase/supabase-js'

export class Supabase {
  static instance
  static supabaseUrl = ''
  static supabaseKey = ''

  static check() {
    this.supabaseKey = localStorage.getItem('sb-key')
    this.supabaseUrl = localStorage.getItem('sb-url')
    return !!(this.supabaseKey && this.supabaseUrl)
  }

  static getInstance() {
    if (!Supabase.instance) {
      if (this.check()) {
        Supabase.instance = createClient(this.supabaseUrl, this.supabaseKey)
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
