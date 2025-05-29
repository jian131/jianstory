import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth-server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Chapter {
  id: number
  story_id: number
  chapter_number: number
  title: string
  slug: string
  content: string
  word_count: number
  created_at: string
  story: {
    id: number
    title: string
    slug: string
    author: string
  }
}

interface Props {
  params: {
    slug: string
    chapterSlug: string
  }
}

function formatReadingTime(wordCount: number): string {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} phút đọc`
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterSlug } = await params
  const supabase = await createSupabaseServerClient()
  const user = await getUser()

  // Fetch current chapter with story info
  const { data: chapter, error } = await supabase
    .from('chapters')
    .select(`
      *,
      story:stories!inner (
        id,
        title,
        slug,
        author
      )
    `)
    .eq('slug', chapterSlug)
    .eq('story.slug', slug)
    .single()

  if (error || !chapter) {
    notFound()
  }

  // Fetch previous and next chapters
  const { data: navChapters } = await supabase
    .from('chapters')
    .select('chapter_number, title, slug')
    .eq('story_id', chapter.story_id)
    .order('chapter_number')

  const currentIndex = navChapters?.findIndex(ch => ch.chapter_number === chapter.chapter_number) ?? -1
  const prevChapter = currentIndex > 0 ? navChapters?.[currentIndex - 1] : null
  const nextChapter = currentIndex < (navChapters?.length ?? 0) - 1 ? navChapters?.[currentIndex + 1] : null

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
                href={`/stories/${chapter.story.slug}`}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                ← Về trang truyện
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-blue-400 transition-colors">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link href="/stories" className="hover:text-blue-400 transition-colors">
            Truyện
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/stories/${chapter.story.slug}`} className="hover:text-blue-400 transition-colors">
            {chapter.story.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white">Chương {chapter.chapter_number}</span>
        </nav>

        {/* Chapter Info */}
        <div className="text-center mb-8 pb-8 border-b border-gray-700">
          <div className="mb-4">
            <Link
              href={`/stories/${chapter.story.slug}`}
              className="text-lg text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {chapter.story.title}
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Chương {chapter.chapter_number}: {chapter.title}
          </h1>

          <div className="flex justify-center items-center space-x-6 text-sm text-gray-400">
            <span>Tác giả: <span className="text-blue-400">{chapter.story.author}</span></span>
            <span>•</span>
            <span>{formatReadingTime(chapter.word_count)}</span>
            <span>•</span>
            <span>{formatDate(chapter.created_at)}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          {prevChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/${prevChapter.slug}`}
              className="btn-secondary px-4 py-2 inline-flex items-center space-x-2"
            >
              <span>←</span>
              <span className="hidden sm:inline">Chương trước</span>
            </Link>
          ) : (
            <div className="px-4 py-2 text-gray-500">
              Chương đầu
            </div>
          )}

          <Link
            href={`/stories/${chapter.story.slug}`}
            className="btn-primary px-4 py-2"
          >
            Danh sách chương
          </Link>

          {nextChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/${nextChapter.slug}`}
              className="btn-secondary px-4 py-2 inline-flex items-center space-x-2"
            >
              <span className="hidden sm:inline">Chương sau</span>
              <span>→</span>
            </Link>
          ) : (
            <div className="px-4 py-2 text-gray-500">
              Chương cuối
            </div>
          )}
        </div>

        {/* Chapter Content */}
        <div className="elevated-card p-8">
          <div className="prose prose-lg max-w-none prose-invert">
            <div className="whitespace-pre-line leading-relaxed text-gray-200 text-lg">
              {chapter.content}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-700">
          {prevChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/${prevChapter.slug}`}
              className="btn-secondary px-6 py-3 inline-flex items-center space-x-2"
            >
              <span>←</span>
              <div className="text-left">
                <div className="text-sm opacity-80">Chương trước</div>
                <div className="font-medium">{prevChapter.title}</div>
              </div>
            </Link>
          ) : (
            <div></div>
          )}

          {nextChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/${nextChapter.slug}`}
              className="btn-primary px-6 py-3 inline-flex items-center space-x-2"
            >
              <div className="text-right">
                <div className="text-sm opacity-80">Chương sau</div>
                <div className="font-medium">{nextChapter.title}</div>
              </div>
              <span>→</span>
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Chapter info */}
        <div className="mt-8 text-center text-sm text-gray-400">
          Chương {chapter.chapter_number} • Cập nhật: {formatDate(chapter.created_at)}
        </div>
      </div>
    </div>
  )
}
