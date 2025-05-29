import Link from 'next/link'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getCloudinaryUrl } from '@/lib/utils'
import {
  FireIcon,
  ClockIcon,
  EyeIcon,
  StarIcon,
  ArrowRightIcon,
  BookOpenIcon,
  SparklesIcon
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
}

export default async function ModernHomePage() {
  const supabase = await createSupabaseServerClient()

  const { data: featuredStories } = await supabase
    .from('stories')
    .select('*')
    .eq('is_featured', true)
    .order('updated_at', { ascending: false })
    .limit(6)

  const { data: latestStories } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  const { data: popularStories } = await supabase
    .from('stories')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(8)

  const { data: completedStories } = await supabase
    .from('stories')
    .select('*')
    .eq('status', 'completed')
    .order('rating_average', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen">
      {/* Hero Section - Simplified */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30"></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold text-gradient mb-6 tracking-tight">
              JianStory
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light">
              Thế giới truyện hay • Giao diện hiện đại • Trải nghiệm tuyệt vời
            </p>
            <Link
              href="/stories"
              className="btn-primary px-10 py-5 text-xl font-semibold inline-flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <SparklesIcon className="w-6 h-6" />
              Khám phá ngay
            </Link>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float-delayed">
          <div className="w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Featured Stories Section */}
        {featuredStories && featuredStories.length > 0 && (
          <section className="mb-20 animate-fade-in-up">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                  <FireIcon className="w-8 h-8 text-white" />
                </div>
                Truyện nổi bật
              </h2>
              <Link
                href="/stories?featured=true"
                className="btn-secondary flex items-center gap-2"
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
          <section className="mb-20 animate-slide-in-right">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <ClockIcon className="w-8 h-8 text-white" />
                </div>
                Mới cập nhật
              </h2>
              <Link
                href="/stories?sort=latest"
                className="btn-secondary flex items-center gap-2"
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
          <section className="mb-20 animate-slide-in-left">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <EyeIcon className="w-8 h-8 text-white" />
                </div>
                Được yêu thích
              </h2>
              <Link
                href="/stories?sort=popular"
                className="btn-secondary flex items-center gap-2"
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
          <section className="mb-20 animate-fade-in-up">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-white flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                  <BookOpenIcon className="w-8 h-8 text-white" />
                </div>
                Truyện hoàn thành
              </h2>
              <Link
                href="/stories?status=completed"
                className="btn-secondary flex items-center gap-2"
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
            <div className="elevated-card p-12 max-w-lg mx-auto">
              <div className="text-8xl mb-8 animate-bounce">📚</div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Chưa có truyện nào
              </h3>
              <p className="text-gray-400 mb-10 text-lg">
                Hãy import một số truyện để bắt đầu khám phá thế giới văn học!
              </p>
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-8">
                <p className="text-blue-300 leading-relaxed">
                  <strong className="text-blue-200 text-lg">💡 Hướng dẫn nhanh:</strong><br />
                  <span className="text-base">
                    1. 🐍 Chạy Python GUI crawler<br />
                    2. ⚡ Import truyện: <code className="bg-blue-800/50 px-3 py-1 rounded-lg text-blue-200 font-mono">npm run import</code>
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Footer */}
      <footer className="border-t border-gray-800/50 bg-gradient-to-t from-gray-900/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gradient mb-6">JianStory</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Website đọc truyện hiện đại với trải nghiệm tuyệt vời
            </p>

            <div className="flex justify-center gap-6 mb-8">
              <Link href="/stories" className="text-gray-400 hover:text-blue-400 transition-colors text-lg">
                📚 Danh sách truyện
              </Link>
              <Link href="/search" className="text-gray-400 hover:text-blue-400 transition-colors text-lg">
                🔍 Tìm kiếm
              </Link>
            </div>

            <div className="pt-8 border-t border-gray-800/50">
              <p className="text-gray-500">
                &copy; 2024 <span className="text-gradient font-semibold">JianStory</span> • Made with 💙
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

  return (
    <Link href={`/stories/${story.slug}`} className="group">
      <div className={`surface-card p-0 overflow-hidden group-hover:scale-105 group-hover:shadow-2xl transition-all duration-500 ${
        compact ? 'h-80' : featured ? 'h-[440px]' : 'h-[420px]'
      }`}>

        <div className={`relative overflow-hidden ${
          compact ? 'h-48' : featured ? 'h-64' : 'h-64'
        }`}>
          <Image
            src={coverUrl}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm ${
              story.status === 'completed' ? 'bg-green-500/90 text-white' :
              story.status === 'ongoing' ? 'bg-blue-500/90 text-white' :
              'bg-yellow-500/90 text-white'
            }`}>
              {story.status === 'completed' ? '✅ Hoàn thành' :
               story.status === 'ongoing' ? '🔄 Đang ra' : '⏸️ Tạm dừng'}
            </span>
          </div>

          {featured && (
            <div className="absolute top-3 right-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
                🔥 HOT
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className={`p-5 ${compact ? 'space-y-2' : 'space-y-3'}`}>
          <h3 className={`font-bold text-white group-hover:text-blue-400 transition-colors leading-tight ${
            compact ? 'text-sm line-clamp-2' : 'text-lg line-clamp-2'
          }`}>
            {story.title}
          </h3>

          <p className={`text-gray-400 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
            ✍️ {story.author}
          </p>

          {!compact && story.description && (
            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
              {story.description}
            </p>
          )}

          <div className={`flex items-center justify-between ${
            compact ? 'text-xs' : 'text-sm'
          } text-gray-500 pt-2`}>
            <span className="flex items-center gap-1.5 font-medium">
              📖 {story.total_chapters}
            </span>
            <span className="flex items-center gap-1.5">
              <EyeIcon className="w-3.5 h-3.5" />
              {formatViewCount(story.view_count)}
            </span>
            {story.rating_average > 0 && (
              <span className="flex items-center gap-1.5">
                <StarIcon className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                {story.rating_average.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
