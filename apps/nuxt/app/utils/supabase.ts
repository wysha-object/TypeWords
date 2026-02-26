import { createClient } from '@supabase/supabase-js'

export class Supabase {
  static instance
  static can_req = false
  static supabaseUrl = ''
  static supabaseKey = ''

  static {
    this.supabaseKey = localStorage.getItem('sb-key')
    this.supabaseUrl = localStorage.getItem('sb-url')
    this.can_req = !!(this.supabaseKey && this.supabaseUrl)
  }

  static getInstance() {
    if (!Supabase.instance) {
      if (this.can_req) {
        Supabase.instance = createClient(this.supabaseUrl, this.supabaseKey)
      } else {
        Supabase.instance = {
          from: () => {
            return {
              select: () => Promise.reject(),
              upsert: () => Promise.reject(),
            }
          },
        }
      }
    }
    return Supabase.instance
  }
}
