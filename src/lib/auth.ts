import { createClient } from '@supabase/supabase-js'

// Tạo Supabase client riêng cho client-side auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const authClient = createClient(supabaseUrl, supabaseKey)

// Client-side auth functions
export const authClientFunctions = {
  async signIn(email: string, password: string) {
    return await authClient.auth.signInWithPassword({
      email,
      password
    })
  },

  async signUp(email: string, password: string, userData?: { username?: string }) {
    return await authClient.auth.signUp({
      email,
      password,
      options: {
        data: userData || {}
      }
    })
  },

  async signOut() {
    return await authClient.auth.signOut()
  },

  async getSession() {
    return await authClient.auth.getSession()
  },

  async getUser() {
    return await authClient.auth.getUser()
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return authClient.auth.onAuthStateChange(callback)
  }
}
