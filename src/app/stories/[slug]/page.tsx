import { createSupabaseServerClient } from '@/lib/supabase'
import { getUser } from '@/lib/auth-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatViewCount, formatDate, getCloudinaryUrl } from '@/lib/utils'
import StoryRating from '@/components/StoryRating'
import {
  ArrowLeftIcon,
  BookOpenIcon,
  EyeIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline'

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
    <div className="min-h-screen bg-gray-950">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Về danh sách truyện
          </Link>
        </div>

        <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">

          {/* Story header */}
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>

            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row gap-8">

                {/* Cover image */}
                <div className="flex-shrink-0">
                  <div className="relative h-80 w-56 mx-auto lg:mx-0 group">
                    <Image
                      src={story.cloudinary_public_id ? getCloudinaryUrl(story.cloudinary_public_id) : story.cover_image || '/placeholder-book.jpg'}
                      alt={story.title}
                      fill
                      className="object-cover rounded-xl shadow-xl transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                  </div>
                </div>

                {/* Story info */}
                <div className="flex-1 space-y-6">

                  {/* Title and author */}
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
                      {story.title}
                    </h1>
                    <p className="text-xl text-gray-300">
                      Tác giả: <span className="font-semibold text-blue-400">{story.author}</span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-4 py-2 rounded-lg font-medium ${
                      story.status === 'completed' ? 'bg-green-600 text-white' :
                      story.status === 'ongoing' ? 'bg-blue-600 text-white' :
                      'bg-yellow-600 text-white'
                    }`}>
                      {story.status === 'completed' ? 'Hoàn thành' :
                       story.status === 'ongoing' ? 'Đang ra' : 'Tạm dừng'}
                    </span>

                    <div className="flex items-center gap-1 bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                      <BookOpenIcon className="w-4 h-4" />
                      {chapters?.length || 0} chương
                    </div>

                    <div className="flex items-center gap-1 bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                      <EyeIcon className="w-4 h-4" />
                      {formatViewCount(story.view_count)}
                    </div>

                    <div className="flex items-center gap-1 bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(story.created_at)}
                    </div>

                    {story.rating_average > 0 && (
                      <div className="flex items-center gap-1 bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        {story.rating_average.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Reading progress or start reading */}
                  {readingProgress ? (
                    <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Tiến độ đọc
                      </h3>
                      <p className="text-blue-300 mb-4">
                        Bạn đã đọc đến chương {readingProgress.chapter.chapter_number}: {readingProgress.chapter.title}
                      </p>
                      <Link
                        href={`/stories/${story.slug}/chapters/${readingProgress.chapter.slug}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <BookOpenIcon className="w-4 h-4" />
                        Đọc tiếp chương {readingProgress.chapter.chapter_number}
                      </Link>
                    </div>
                  ) : chapters && chapters.length > 0 && (
                    <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Bắt đầu đọc
                      </h3>
                      <p className="text-green-300 mb-4">
                        Khám phá cuộc phiêu lưu mới với chương đầu tiên
                      </p>
                      <Link
                        href={`/stories/${story.slug}/chapters/${chapters[0].slug}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
                      >
                        <BookOpenIcon className="w-4 h-4" />
                        Đọc chương 1
                      </Link>
                    </div>
                  )}

                  {/* Description */}
                  {story.description && (
                    <div className="bg-gray-700/30 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Giới thiệu
                      </h3>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                        {story.description}
                      </p>
                    </div>
                  )}

                  {/* Story Rating */}
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
          <div className="border-t border-gray-700 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                Danh sách chương
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
                {chapters?.length || 0} chương
              </span>
            </div>

            {chapters && chapters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {chapters.map((chapter, index) => (
                  <Link
                    key={chapter.id}
                    href={`/stories/${story.slug}/chapters/${chapter.slug}`}
                    className="group block"
                  >
                    <div className="bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all duration-200 border border-gray-600 hover:border-blue-500 group-hover:scale-105">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          Chương {chapter.chapter_number}
                        </h3>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors mb-3">
                        {chapter.title}
                      </p>

                      <div className="flex items-center text-xs text-gray-500 gap-3">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {formatDate(chapter.created_at)}
                        </div>
                        {chapter.word_count && (
                          <div className="flex items-center gap-1">
                            <BookOpenIcon className="w-3 h-3" />
                            {chapter.word_count} từ
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-gray-700/30 rounded-xl p-8 max-w-md mx-auto">
                  <div className="text-5xl mb-4">📖</div>
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
      </main>
    </div>
  )
}
