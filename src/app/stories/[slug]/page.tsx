import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatViewCount, formatDate, getCloudinaryUrl } from '@/lib/utils'
import StoryRating from '@/components/StoryRating'

interface Props {
  params: {
    slug: string
  }
}

export default async function StoryPage({ params }: Props) {
  const supabase = await createSupabaseServerClient()
  const user = await getUser()
  const { slug } = await params

  // Lấy thông tin truyện
  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!story) {
    notFound()
  }

  // Lấy danh sách chương
  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('story_id', story.id)
    .order('chapter_number', { ascending: true })

  // Kiểm tra xem người dùng đã bookmark chưa
  let isBookmarked = false
  if (user) {
    const { data: bookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('story_id', story.id)
      .single()
    isBookmarked = !!bookmark
  }

  // Lấy tiến độ đọc
  let readingProgress = null
  if (user) {
    const { data: progress } = await supabase
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
      .eq('user_id', user.id)
      .eq('story_id', story.id)
      .order('last_read_at', { ascending: false })
      .limit(1)
      .single()
    readingProgress = progress
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="elevated-card overflow-hidden backdrop-blur-sm">
            {/* Story header */}
            <div className="relative">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>

              <div className="relative px-6 py-8 sm:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                {/* Cover image */}
                  <div className="flex-shrink-0">
                    <div className="relative h-80 w-56 mx-auto lg:mx-0 group">
                  <Image
                    src={story.cloudinary_public_id ? getCloudinaryUrl(story.cloudinary_public_id) : story.cover_image || '/placeholder-book.jpg'}
                    alt={story.title}
                    fill
                        className="object-cover rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                    </div>
                </div>

                {/* Story info */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-4xl font-bold text-white mb-2 leading-tight">
                          {story.title}
                        </h1>
                        <p className="text-xl text-gray-300 flex items-center">
                          <span className="text-2xl mr-2">✍️</span>
                          Tác giả: <span className="font-semibold ml-1 text-blue-400">{story.author}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className={`px-4 py-2 rounded-full font-medium ${
                        story.status === 'completed' ? 'bg-green-600 text-white' :
                        story.status === 'ongoing' ? 'bg-blue-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>
                        {story.status === 'completed' ? '✅ Hoàn thành' :
                         story.status === 'ongoing' ? '🔄 Đang ra' : '⏸️ Tạm dừng'}
                      </span>
                      <span className="bg-gray-700 text-gray-200 px-4 py-2 rounded-full">
                        📚 {story.total_chapters} chương
                      </span>
                      <span className="bg-gray-700 text-gray-200 px-4 py-2 rounded-full">
                        👁 {formatViewCount(story.view_count)} lượt xem
                      </span>
                      <span className="bg-gray-700 text-gray-200 px-4 py-2 rounded-full">
                        📅 {formatDate(story.created_at)}
                      </span>
                    </div>

                    {readingProgress && (
                      <div className="glass-card p-6 border border-blue-500/30">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <span className="text-xl mr-2">📖</span>
                          Tiến độ đọc
                        </h3>
                        <p className="text-blue-300 mb-4">
                          Bạn đã đọc đến chương {readingProgress.chapter.chapter_number}: {readingProgress.chapter.title}
                        </p>
                        <Link
                          href={`/stories/${story.slug}/chapters/${readingProgress.chapter.slug}`}
                          className="btn-primary px-6 py-3 inline-flex items-center"
                        >
                          <span className="mr-2">📚</span>
                          Đọc tiếp chương {readingProgress.chapter.chapter_number}
                        </Link>
                      </div>
                    )}

                    {!readingProgress && chapters && chapters.length > 0 && (
                      <div className="glass-card p-6 border border-green-500/30">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <span className="text-xl mr-2">🚀</span>
                          Bắt đầu đọc
                        </h3>
                        <p className="text-green-300 mb-4">
                          Khám phá cuộc phiêu lưu mới với chương đầu tiên
                        </p>
                        <Link
                          href={`/stories/${story.slug}/chapters/${chapters[0].slug}`}
                          className="btn-primary px-6 py-3 inline-flex items-center"
                        >
                          <span className="mr-2">🌟</span>
                          Đọc chương 1
                        </Link>
                      </div>
                    )}

                    {story.description && (
                      <div className="surface-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <span className="text-xl mr-2">📝</span>
                          Giới thiệu
                        </h3>
                        <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                          {story.description}
                        </p>
                      </div>
                    )}

                    {/* Story Rating Section */}
                    <StoryRating
                      storyId={story.id}
                      currentRating={story.rating_average || 0}
                      totalRatings={story.rating_count || 0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter list */}
            <div className="border-t border-gray-700 px-6 py-8 sm:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <span className="text-2xl mr-3">📚</span>
                  Danh sách chương
                </h2>
                <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                  {chapters?.length || 0} chương
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {chapters?.map((chapter, index) => (
                  <Link
                    key={chapter.id}
                    href={`/stories/${story.slug}/chapters/${chapter.slug}`}
                    className="group block"
                  >
                    <div className="surface-card p-5 group-hover:scale-105 transition-all duration-200 border border-gray-600 hover:border-blue-500">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          Chương {chapter.chapter_number}
                        </h3>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {chapter.title}
                      </p>
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <span>📅 {formatDate(chapter.created_at)}</span>
                        {chapter.word_count && (
                          <>
                            <span className="mx-2">•</span>
                            <span>📄 {chapter.word_count} từ</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {(!chapters || chapters.length === 0) && (
                <div className="text-center py-12">
                  <div className="elevated-card p-8 max-w-md mx-auto">
                    <div className="text-6xl mb-4">📖</div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Chưa có chương nào
                    </h3>
                    <p className="text-gray-400">
                      Truyện này chưa có chương nào được đăng tải.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
