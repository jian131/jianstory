'use client'

import { useEffect, useRef, useState } from 'react'
import { throttle } from 'lodash'

interface Props {
  storyId: number
  chapterId: number
}

export default function ReadingProgressTracker({ storyId, chapterId }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const saveProgress = throttle(async () => {
      try {
        const response = await fetch('/api/reading-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            storyId,
            chapterId,
            scrollPosition: Math.round(scrollPosition)
          })
        })
        if (!response.ok) {
          throw new Error('Failed to save reading progress')
        }
      } catch (error) {
        console.error('Error saving reading progress:', error)
      }
    }, 1000) // Throttle to once per second

    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100
        setScrollPosition(progress)
        saveProgress()
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll)
      return () => {
        contentElement.removeEventListener('scroll', handleScroll)
        saveProgress.cancel()
      }
    }
  }, [storyId, chapterId, scrollPosition])

  return (
    <div
      ref={contentRef}
      className="fixed top-0 left-0 w-1 h-full bg-blue-500"
      style={{ width: `${scrollPosition}%` }}
    />
  )
}
