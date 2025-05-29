'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface StoryRatingProps {
  storyId: string | number  // Support both UUID string and number
  currentRating: number
  totalRatings: number
}

export default function StoryRating({ storyId, currentRating, totalRatings }: StoryRatingProps) {
  const { user } = useAuth()
  const [userRating, setUserRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [displayRating, setDisplayRating] = useState(currentRating)
  const [displayCount, setDisplayCount] = useState(totalRatings)

  // Debug log - improved
  useEffect(() => {
    console.log('StoryRating Debug:', {
      storyId,
      storyIdType: typeof storyId,
      storyIdValue: storyId?.toString(),
      user: user?.id,
      userAuth: !!user,
      isValidStoryId: storyId && storyId !== 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    })
  }, [storyId, user])

  useEffect(() => {
    if (user && storyId && storyId !== 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') {
      loadUserRating()
    }
  }, [user, storyId])

  const loadUserRating = async () => {
    if (!user || !storyId || storyId === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('story_ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('story_id', storyId.toString())
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Load rating error:', error)
        return
      }

      if (data) {
        setUserRating(data.rating)
      }
    } catch (error) {
      console.warn('User rating not found:', error)
    }
  }

  const submitRating = async (rating: number) => {
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá')
      return
    }

    if (!storyId || storyId === 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') {
      alert('Story ID không hợp lệ. Vui lòng tải lại trang.')
      console.error('Invalid story ID:', storyId)
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Sử dụng user từ auth context thay vì gọi lại getUser
      if (!user?.id) {
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
        return
      }

      console.log('Submitting rating:', {
        user_id: user.id,
        story_id: storyId.toString(),
        rating,
        storyIdType: typeof storyId
      })

      // Insert/update rating
      const { data, error } = await supabase
        .from('story_ratings')
        .upsert({
          user_id: user.id,
          story_id: storyId.toString(),
          rating: rating
        }, {
          onConflict: 'user_id, story_id'
        })
        .select()

      if (error) {
        console.error('Supabase upsert error:', error)

        if (error.code === '23503') {
          alert('Không tìm thấy truyện này trong hệ thống')
        } else if (error.code === '42501') {
          alert('Bạn không có quyền đánh giá truyện này')
        } else if (error.message?.includes('relation "story_ratings" does not exist')) {
          alert('Hệ thống đánh giá chưa được thiết lập. Vui lòng liên hệ admin.')
        } else {
          alert('Có lỗi xảy ra khi gửi đánh giá: ' + error.message)
        }
        return
      }

      console.log('Rating submitted successfully:', data)

      // Cập nhật local state
      const oldRating = userRating
      setUserRating(rating)

      // Update local display for smooth UX
      let newCount = displayCount
      let newAverage = displayRating

      if (oldRating === 0) {
        // New rating
        newCount = displayCount + 1
        newAverage = ((displayRating * displayCount) + rating) / newCount
      } else {
        // Update existing rating
        newAverage = ((displayRating * displayCount) - oldRating + rating) / displayCount
      }

      setDisplayRating(Math.round(newAverage * 10) / 10)
      setDisplayCount(newCount)

      alert('Đánh giá thành công!')

    } catch (error: any) {
      console.error('Error submitting rating:', error)
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if story ID is valid (not placeholder)
  const isValidStoryId = storyId && storyId !== 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

  const renderStars = () => {
    const stars = []
    const activeRating = hoverRating || userRating

    for (let i = 1; i <= 5; i++) {
      const isActive = i <= activeRating
      const isHovered = i <= hoverRating

      stars.push(
        <button
          key={i}
          onClick={() => isValidStoryId && submitRating(i)}
          onMouseEnter={() => user && isValidStoryId && setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={!user || isSubmitting || !isValidStoryId}
          className={`transition-all duration-200 ${
            user && !isSubmitting && isValidStoryId
              ? 'hover:scale-110 cursor-pointer'
              : 'cursor-default'
          }`}
          title={
            !isValidStoryId
              ? 'Story ID không hợp lệ'
              : !user
              ? 'Đăng nhập để đánh giá'
              : `Đánh giá ${i} sao`
          }
        >
          {isActive ? (
            <StarSolidIcon className={`w-6 h-6 ${
              isHovered && user && isValidStoryId
                ? 'text-yellow-300'
                : 'text-yellow-400'
            }`} />
          ) : (
            <StarIcon className={`w-6 h-6 ${
              user && isValidStoryId
                ? 'text-gray-400 hover:text-yellow-400'
                : 'text-gray-500'
            }`} />
          )}
        </button>
      )
    }

    return stars
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
      {/* Stars */}
      <div className="flex items-center gap-1">
        {renderStars()}
      </div>

      {/* Rating Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-yellow-400">
            {displayRating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-400">
            ({displayCount} đánh giá)
          </span>
        </div>

        {user && userRating > 0 && isValidStoryId && (
          <span className="text-xs text-blue-400">
            Bạn đã đánh giá {userRating} sao
          </span>
        )}

        {!user && (
          <span className="text-xs text-gray-500">
            Đăng nhập để đánh giá
          </span>
        )}

        {!isValidStoryId && (
          <span className="text-xs text-red-400">
            Story ID không hợp lệ
          </span>
        )}
      </div>

      {/* Loading Indicator */}
      {isSubmitting && (
        <div className="ml-auto">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
