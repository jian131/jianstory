import { createSupabaseServerClient } from './supabase'

// Server-side auth functions
export async function getUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}
