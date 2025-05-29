import { createSupabaseServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

// Thêm bookmark
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { storyId } = await request.json()

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID là bắt buộc' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert([
        {
          user_id: user.id,
          story_id: storyId
        }
      ])
      .select()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Truyện đã được đánh dấu' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in bookmark:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Xóa bookmark
export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
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

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('story_id', storyId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in remove bookmark:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// Lấy danh sách bookmark
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('bookmarks')
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
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ bookmarks: data })
  } catch (error) {
    console.error('Error in get bookmarks:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
