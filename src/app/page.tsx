import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getCloudinaryUrl } from '@/lib/utils'
import {
  ArrowRightIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface Story {
  id: number
  title: string
  slug: string
  author: string
  description?: string
  cover_image?: string
  cloudinary_public_id?: string
  total_chapters: number
  view_count: number
  rating_average: number
  rating_count: number
  status: 'ongoing' | 'completed' | 'hiatus'
  created_at: string
  chapters?: { count: number }[]
}

export default async function ModernHomePage() {
  const supabase = await createSupabaseServerClient()

  // Query stories với chapter count thực tế
  const { data: featuredStories } = await supabase
    .from('stories')
    .select(`
      *,
      chapters(count)
    `)
    .eq('is_featured', true)
    .order('updated_at', { ascending: false })
    .limit(6)

  const { data: latestStories } = await supabase
    .from('stories')
    .select(`
      *,
      chapters(count)
    `)
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: popularStories } = await supabase
    .from('stories')
    .select(`
      *,
      chapters(count)
    `)
    .order('view_count', { ascending: false })
    .limit(8)

  const { data: completedStories } = await supabase
    .from('stories')
    .select(`
      *,
      chapters(count)
    `)
    .eq('status', 'completed')
    .order('rating_average', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section - Enhanced */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              JianStory
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light max-w-3xl mx-auto">
              Thế giới truyện hay với giao diện đơn giản và trải nghiệm tuyệt vời
            </p>
            <Link
              href="/stories"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-4 rounded-xl text-lg font-medium inline-flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Khám phá ngay
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Featured Stories Section */}
        {featuredStories && featuredStories.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Truyện nổi bật
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>
              <Link
                href="/stories?featured=true"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Xem tất cả <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredStories.map((story) => (
                <ModernStoryCard key={story.id} story={story} featured />
              ))}
            </div>
          </section>
        )}

        {/* Latest Stories Section */}
        {latestStories && latestStories.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Mới cập nhật
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
              </div>
              <Link
                href="/stories?sort=latest"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Xem tất cả <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {latestStories.slice(0, 12).map((story) => (
                <ModernStoryCard key={story.id} story={story} compact />
              ))}
            </div>
          </section>
        )}

        {/* Popular Stories Section */}
        {popularStories && popularStories.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Được yêu thích
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <Link
                href="/stories?sort=popular"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Xem tất cả <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {popularStories.map((story) => (
                <ModernStoryCard key={story.id} story={story} compact />
              ))}
            </div>
          </section>
        )}

        {/* Completed Stories Section */}
        {completedStories && completedStories.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Truyện hoàn thành
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
              </div>
              <Link
                href="/stories?status=completed"
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Xem tất cả <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {completedStories.map((story) => (
                <ModernStoryCard key={story.id} story={story} compact />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {(!latestStories || latestStories.length === 0) && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 max-w-lg mx-auto border border-gray-700 shadow-2xl">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Chưa có truyện nào
              </h3>
              <p className="text-gray-400 mb-8">
                Hãy import một số truyện để bắt đầu khám phá!
              </p>
              <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                <p className="text-gray-300 text-sm">
                  <strong className="text-blue-400">Hướng dẫn:</strong><br />
                  1. Chạy Python GUI crawler<br />
                  2. Import truyện: <code className="bg-gray-600 px-2 py-1 rounded text-blue-300">npm run import</code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">JianStory</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Website đọc truyện đơn giản với trải nghiệm tốt nhất
            </p>

            <div className="flex justify-center gap-8 mb-6">
              <Link href="/stories" className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800">
                Danh sách truyện
              </Link>
              <Link href="/search" className="text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800">
                Tìm kiếm
              </Link>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                &copy; 2024 JianStory - Nền tảng đọc truyện hiện đại
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ModernStoryCard({
  story,
  compact = false,
  featured = false
}: {
  story: Story
  compact?: boolean
  featured?: boolean
}) {
  const coverUrl = story.cloudinary_public_id
    ? getCloudinaryUrl(story.cloudinary_public_id, { width: 300, height: 400, quality: 80 })
    : story.cover_image || '/placeholder-book.jpg'

  const formatViewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  // Đếm chapters thực tế giống như trong trang detail
  const actualChapterCount = story.chapters?.[0]?.count || 0

  return (
    <Link href={`/stories/${story.slug}`} className="group">
      <div className={`bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden hover:from-gray-750 hover:to-gray-850 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-gray-600 ${
        compact ? 'h-80' : 'h-[420px]'
      }`}>

        <div className={`relative overflow-hidden ${
          compact ? 'h-48' : 'h-64'
        }`}>
          <Image
            src={coverUrl}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm border ${
              story.status === 'completed' ? 'bg-green-600/90 text-white border-green-500' :
              story.status === 'ongoing' ? 'bg-blue-600/90 text-white border-blue-500' :
              'bg-yellow-600/90 text-white border-yellow-500'
            }`}>
              {story.status === 'completed' ? 'Hoàn thành' :
               story.status === 'ongoing' ? 'Đang ra' : 'Tạm dừng'}
            </span>
          </div>

          {featured && (
            <div className="absolute top-3 right-3">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-red-500 shadow-lg">
                ⭐ Nổi bật
              </div>
            </div>
          )}
        </div>

        <div className={`p-4 ${compact ? 'space-y-2' : 'space-y-3'}`}>
          <h3 className={`font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight ${
            compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-2'
          }`}>
            {story.title}
          </h3>

          <p className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            {story.author}
          </p>

          {!compact && story.description && (
            <p className="text-gray-500 text-sm line-clamp-2">
              {story.description}
            </p>
          )}

          <div className={`flex items-center justify-between ${
            compact ? 'text-xs' : 'text-sm'
          } text-gray-500`}>
            <span className="bg-gray-700/50 px-2 py-1 rounded-md">
              {actualChapterCount} chương
            </span>
            <span className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-md">
              <EyeIcon className="w-3 h-3" />
              {formatViewCount(story.view_count)}
            </span>
            {story.rating_average > 0 && (
              <span className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-md">
                <StarIcon className="w-3 h-3 text-yellow-400" />
                {story.rating_average.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
