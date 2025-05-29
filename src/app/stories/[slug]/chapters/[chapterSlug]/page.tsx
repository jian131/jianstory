import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReadingProgressTracker from './ReadingProgressTracker'
import ChapterReader from './ChapterReader'

interface Props {
  params: {
    slug: string
    chapterSlug: string
  }
}

export default async function ChapterPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()
  const user = await getUser()
  const { slug, chapterSlug } = await params

  // Get the story
  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!story) {
    notFound()
  }

  // Get current chapter
  const { data: chapter } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', story.id)
    .eq('slug', chapterSlug)
    .single()

  if (!chapter) {
    notFound()
  }

  // Get previous and next chapters
  const { data: prevChapter } = await supabase
    .from('chapters')
    .select('slug, title, chapter_number')
    .eq('story_id', story.id)
    .lt('chapter_number', chapter.chapter_number)
    .order('chapter_number', { ascending: false })
    .limit(1)
    .single()

  const { data: nextChapter } = await supabase
    .from('chapters')
    .select('slug, title, chapter_number')
    .eq('story_id', story.id)
    .gt('chapter_number', chapter.chapter_number)
    .order('chapter_number', { ascending: true })
    .limit(1)
    .single()

  const chapterWithStory = {
    ...chapter,
    story
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="elevated-card border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-400">
              JianStory
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href={`/stories/${story.slug}`}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                ← Về trang truyện
              </Link>
            </div>
          </div>
        </div>
      </header>

      <ChapterReader
        chapter={chapterWithStory}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
      />

      {/* Reading progress tracking */}
      {user && (
        <ReadingProgressTracker
          storyId={story.id}
          chapterId={chapter.id}
        />
      )}
    </div>
  )
}
