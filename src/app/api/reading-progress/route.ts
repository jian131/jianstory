import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

// Cập nhật tiến độ đọc
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { storyId, chapterId, scrollPosition } = await request.json()
    if (!storyId || !chapterId) {
      return NextResponse.json(
        { error: 'Story ID và Chapter ID là bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
      .from('reading_progress')
      .upsert(
        {
          user_id: session.userId,
          story_id: storyId,
          chapter_id: chapterId,
          scroll_position: scrollPosition || 0,
          last_read_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,story_id,chapter_id'
        }
      )

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in update reading progress:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Lấy tiến độ đọc của một truyện
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID là bắt buộc' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('reading_progress')
      .select(`
        *,
        chapter:chapters (
          id,
          title,
          slug,
          chapter_number
        )
      `)
      .eq('user_id', session.userId)
      .eq('story_id', storyId)
      .order('last_read_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows returned
      throw error
    }

    return NextResponse.json({ progress: data || null })
  } catch (error) {
    console.error('Error in get reading progress:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Lấy lịch sử đọc
export async function list() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('reading_progress')
      .select(`
        *,
        story:stories (
          id,
          title,
          slug,
          author,
          description,
          status,
          total_chapters,
          view_count,
          created_at,
          cloudinary_public_id,
          cover_image
        ),
        chapter:chapters (
          id,
          title,
          slug,
          chapter_number
        )
      `)
      .eq('user_id', session.userId)
      .order('last_read_at', { ascending: false })

    if (error) {
      throw error
    }

    // Group by story and get latest chapter read
    const history = data.reduce((acc: any[], curr) => {
      const existingStory = acc.find(item => item.story_id === curr.story_id)
      if (!existingStory) {
        acc.push(curr)
      } else if (new Date(curr.last_read_at) > new Date(existingStory.last_read_at)) {
        const index = acc.findIndex(item => item.story_id === curr.story_id)
        acc[index] = curr
      }
      return acc
    }, [])

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Error in get reading history:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
