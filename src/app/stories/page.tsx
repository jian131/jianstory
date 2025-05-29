import { createSupabaseServerClient } from '@/lib/supabase'
import { formatDate, formatViewCount, getCloudinaryUrl } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  FireIcon,
  BookOpenIcon,
  EyeIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface Story {
  id: number
  title: string
  slug: string
  author: string
  description?: string
  status: string
  total_chapters: number
  view_count: number
  created_at: string
  cloudinary_public_id?: string
  cover_image?: string
  chapters?: { count: number }[]
}

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>
}) {
  const { page = '1', search, sort = 'latest' } = await searchParams
  const currentPage = parseInt(page)
  const pageSize = 12

  const supabase = await createSupabaseServerClient()

  // Build query với chapters count
  let query = supabase
    .from('stories')
    .select(`
      *,
      chapters(count)
    `, { count: 'exact' })

  // Search filter
  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
  }

  // Sort
  switch (sort) {
    case 'popular':
      query = query.order('view_count', { ascending: false })
      break
    case 'chapters':
      query = query.order('total_chapters', { ascending: false })
      break
    case 'latest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Pagination
  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: stories, error, count } = await query

  if (error) {
    console.error('Error fetching stories:', error)
  }

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back to Home */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Kho truyện JianStory
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl mb-6">
            <div className="flex flex-col lg:flex-row gap-4">

              {/* Search */}
              <form className="flex-1" action="/stories" method="GET">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Tìm kiếm truyện, tác giả..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <MagnifyingGlassIcon className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Sort Filters */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/stories?sort=latest${search ? `&search=${search}` : ''}`}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sort === 'latest'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <ClockIcon className="w-4 h-4" />
                  Mới nhất
                </Link>
                <Link
                  href={`/stories?sort=popular${search ? `&search=${search}` : ''}`}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sort === 'popular'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <FireIcon className="w-4 h-4" />
                  Phổ biến
                </Link>
                <Link
                  href={`/stories?sort=chapters${search ? `&search=${search}` : ''}`}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    sort === 'chapters'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <BookOpenIcon className="w-4 h-4" />
                  Nhiều chương
                </Link>
              </div>
            </div>

            {/* Results info */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div>
                  {search && (
                    <span className="mb-2 block">
                      Kết quả cho: <span className="text-blue-400 font-medium">"{search}"</span>
                    </span>
                  )}
                  <span>
                    Hiển thị <span className="text-white font-medium">{stories?.length || 0}</span> truyện
                    (trang <span className="text-white font-medium">{currentPage}</span>/<span className="text-white font-medium">{totalPages}</span>)
                  </span>
                </div>
                <div className="text-xs bg-gray-700 px-3 py-1 rounded-full">
                  Tổng: {count || 0} truyện
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        {stories && stories.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mb-8">
                {currentPage > 1 && (
                  <Link
                    href={`/stories?page=${currentPage - 1}&sort=${sort}${search ? `&search=${search}` : ''}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Trước
                  </Link>
                )}

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                    return (
                      <Link
                        key={pageNum}
                        href={`/stories?page=${pageNum}&sort=${sort}${search ? `&search=${search}` : ''}`}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </Link>
                    )
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={`/stories?page=${currentPage + 1}&sort=${sort}${search ? `&search=${search}` : ''}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                  >
                    Sau
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 max-w-lg mx-auto border border-gray-700 shadow-2xl">
              <div className="text-6xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {search ? 'Không tìm thấy truyện nào' : 'Chưa có truyện nào'}
              </h3>
              <p className="text-gray-400 mb-8">
                {search
                  ? `Không tìm thấy kết quả cho "${search}". Thử tìm kiếm với từ khóa khác.`
                  : 'Hãy thêm một số truyện để bắt đầu!'
                }
              </p>
              {search ? (
                <Link
                  href="/stories"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Xem tất cả truyện
                </Link>
              ) : (
                <div className="bg-gray-700/50 rounded-xl p-6 border border-gray-600">
                  <p className="text-gray-300 text-sm">
                    <strong className="text-blue-400">Hướng dẫn:</strong><br />
                    1. Chạy Python GUI crawler<br />
                    2. Import truyện: <code className="bg-gray-600 px-2 py-1 rounded text-blue-300">npm run import</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StoryCard({ story }: { story: Story }) {
  const coverUrl = story.cloudinary_public_id
    ? getCloudinaryUrl(story.cloudinary_public_id, {
        width: 300,
        height: 400,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      })
    : story.cover_image || '/placeholder-book.jpg'

  // Đếm chapters thực tế giống như trong trang chủ
  const actualChapterCount = story.chapters?.[0]?.count || 0

  return (
    <Link href={`/stories/${story.slug}`} className="group">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden hover:from-gray-750 hover:to-gray-850 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-gray-700 hover:border-gray-600 h-80">

        <div className="relative h-48 overflow-hidden">
          <Image
            src={coverUrl}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
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
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight text-sm line-clamp-2">
            {story.title}
          </h3>

          <p className="text-gray-400 text-xs">
            {story.author}
          </p>

          {story.description && (
            <p className="text-gray-500 text-xs line-clamp-2">
              {story.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="bg-gray-700/50 px-2 py-1 rounded-md">
              {actualChapterCount} chương
            </span>
            <span className="flex items-center gap-1 bg-gray-700/50 px-2 py-1 rounded-md">
              <EyeIcon className="w-3 h-3" />
              {formatViewCount(story.view_count)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
