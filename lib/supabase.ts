import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For client-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client components that need auth
export const createBrowserClient = () => {
  return createClientComponentClient()
}

// For server components
export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}

// For server-side operations with service role
export const createServiceRoleClient = () => {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Database types
export type Database = {
  public: {
    Tables: {
      stories: {
        Row: {
          id: string
          title: string
          description: string | null
          author: string
          cover_image_url: string | null
          status: 'ongoing' | 'completed' | 'hiatus'
          genres: string[] | null
          total_chapters: number
          total_views: number
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          author: string
          cover_image_url?: string | null
          status?: 'ongoing' | 'completed' | 'hiatus'
          genres?: string[] | null
          total_chapters?: number
          total_views?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          author?: string
          cover_image_url?: string | null
          status?: 'ongoing' | 'completed' | 'hiatus'
          genres?: string[] | null
          total_chapters?: number
          total_views?: number
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          story_id: string
          chapter_number: number
          title: string
          content: string
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          chapter_number: number
          title: string
          content: string
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          chapter_number?: number
          title?: string
          content?: string
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      reading_history: {
        Row: {
          id: string
          user_id: string
          story_id: string
          chapter_id: string
          last_read_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          chapter_id: string
          last_read_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          chapter_id?: string
          last_read_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          story_id: string
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          rating: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          rating?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          story_id: string
          chapter_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          chapter_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          chapter_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
