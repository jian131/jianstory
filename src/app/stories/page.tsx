import { createSupabaseServerClient } from '@/lib/supabase'
import { formatDate, formatViewCount, getCloudinaryUrl } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

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

  // Build query
  let query = supabase
    .from('stories')
    .select('*', { count: 'exact' })

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
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            📚 Danh sách truyện
          </h1>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form className="flex-1" action="/stories" method="GET">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Tìm kiếm truyện, tác giả..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  🔍
                </button>
              </div>
            </form>

            <div className="flex gap-2">
              <Link
                href={`/stories?sort=latest${search ? `&search=${search}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'latest'
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                🕐 Mới nhất
              </Link>
              <Link
                href={`/stories?sort=popular${search ? `&search=${search}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'popular'
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                🔥 Phổ biến
              </Link>
              <Link
                href={`/stories?sort=chapters${search ? `&search=${search}` : ''}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sort === 'chapters'
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                📖 Nhiều chương
              </Link>
            </div>
          </div>

          {/* Results info */}
          <div className="text-sm text-gray-400">
            {search && (
              <p className="mb-2">
                Kết quả tìm kiếm cho: <strong className="text-blue-400">"{search}"</strong>
              </p>
            )}
            <p>
              Hiển thị {stories?.length || 0} truyện (trang {currentPage}/{totalPages})
            </p>
          </div>
        </div>

        {/* Stories Grid */}
        {stories && stories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                {currentPage > 1 && (
                  <Link
                    href={`/stories?page=${currentPage - 1}&sort=${sort}${search ? `&search=${search}` : ''}`}
                    className="px-3 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800"
                  >
                    ← Trước
                  </Link>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                  return (
                    <Link
                      key={pageNum}
                      href={`/stories?page=${pageNum}&sort=${sort}${search ? `&search=${search}` : ''}`}
                      className={`px-3 py-2 rounded-lg ${
                        pageNum === currentPage
                          ? 'btn-primary'
                          : 'border border-gray-600 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  )
                })}

                {currentPage < totalPages && (
                  <Link
                    href={`/stories?page=${currentPage + 1}&sort=${sort}${search ? `&search=${search}` : ''}`}
                    className="px-3 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800"
                  >
                    Sau →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="elevated-card p-12 max-w-md mx-auto">
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
                  className="btn-primary px-6 py-3"
                >
                  Xem tất cả truyện
                </Link>
              ) : (
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-6">
                  <p className="text-blue-300 text-sm leading-relaxed">
                    <strong className="text-blue-200">💡 Hướng dẫn:</strong><br />
                    1. 🐍 Chạy crawler Python để lấy dữ liệu truyện<br />
                    2. ⚡ Chạy lệnh: <code className="bg-blue-800/50 px-2 py-1 rounded text-blue-200">npm run import</code>
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

  return (
    <Link href={`/stories/${story.slug}`} className="group">
      <div className="surface-card p-0 overflow-hidden group-hover:scale-105 transition-all duration-300 h-96">
        <div className="relative h-56">
          <Image
            src={coverUrl}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />

          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              story.status === 'completed' ? 'bg-green-600 text-white' :
              story.status === 'ongoing' ? 'bg-blue-600 text-white' :
              'bg-yellow-600 text-white'
            }`}>
              {story.status === 'completed' ? '✅ Hoàn thành' :
               story.status === 'ongoing' ? '🔄 Đang ra' : '⏸️ Tạm dừng'}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg line-clamp-2">
            {story.title}
          </h3>
          <p className="text-gray-400 text-sm">
            ✍️ {story.author}
          </p>

          {story.description && (
            <p className="text-gray-500 text-sm line-clamp-2">
              {story.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              📖 {story.total_chapters}
            </span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1">
                👁 {formatViewCount(story.view_count)}
              </span>
              <span className="flex items-center gap-1">
                📅 {formatDate(story.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
