'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ReadingSettings from '@/components/ReadingSettings'
import {
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { type ReadingSettings as ReadingSettingsType } from '@/types/reading'

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

interface ChapterReaderProps {
  chapter: Chapter
  prevChapter?: { slug: string; chapter_number: number } | null
  nextChapter?: { slug: string; chapter_number: number } | null
}

const defaultSettings: ReadingSettingsType = {
  fontSize: 18,
  fontFamily: 'Georgia, serif',
  lineHeight: 1.8,
  background: '#111827',
  textColor: '#f9fafb',
  theme: 'dark'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

function formatReadingTime(wordCount: number): string {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} phút`
}

export default function ChapterReader({ chapter, prevChapter, nextChapter }: ChapterReaderProps) {
  const [settings, setSettings] = useState<ReadingSettingsType>(defaultSettings)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('jianstory-reading-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Error loading reading settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage when changed
  const handleSettingsChange = (newSettings: ReadingSettingsType) => {
    setSettings(newSettings)
    localStorage.setItem('jianstory-reading-settings', JSON.stringify(newSettings))
  }

  return (
    <div style={{ backgroundColor: settings.background, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm" style={{ color: settings.textColor + '70' }}>
            <li>
              <Link href="/" className="hover:text-blue-400 transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href={`/stories/${chapter.story.slug}`} className="hover:text-blue-400 transition-colors">
                {chapter.story.title}
              </Link>
            </li>
            <li>/</li>
            <li style={{ color: settings.textColor }}>
              Chương {chapter.chapter_number}
            </li>
          </ol>
        </nav>

        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-8 gap-4">
          {prevChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/chapters/${prevChapter.slug}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-105 group"
              style={{
                borderColor: settings.textColor + '30',
                color: settings.textColor,
                backgroundColor: settings.textColor + '05'
              }}
            >
              <ChevronLeftIcon className="w-4 h-4 group-hover:text-blue-400" />
              <span className="font-medium">Chương {prevChapter.chapter_number}</span>
            </Link>
          ) : (
            <div></div>
          )}

          <Link
            href={`/stories/${chapter.story.slug}`}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 hover:scale-105 group"
            style={{
              borderColor: settings.textColor + '30',
              color: settings.textColor,
              backgroundColor: settings.textColor + '05'
            }}
          >
            <BookOpenIcon className="w-4 h-4 group-hover:text-blue-400" />
            <span className="font-medium">Về trang truyện</span>
          </Link>

          {nextChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/chapters/${nextChapter.slug}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-105 group"
              style={{
                borderColor: settings.textColor + '30',
                color: settings.textColor,
                backgroundColor: settings.textColor + '05'
              }}
            >
              <span className="font-medium">Chương {nextChapter.chapter_number}</span>
              <ChevronRightIcon className="w-4 h-4 group-hover:text-blue-400" />
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Chapter Content */}
        <article
          className="rounded-2xl shadow-2xl overflow-hidden border"
          style={{
            backgroundColor: settings.textColor + '05',
            borderColor: settings.textColor + '20'
          }}
        >
          {/* Header */}
          <header
            className="px-8 py-8 border-b"
            style={{
              backgroundColor: settings.textColor + '03',
              borderColor: settings.textColor + '15'
            }}
          >
            <div className="text-center space-y-4">
              <h1
                className="text-3xl font-bold"
                style={{ color: settings.textColor }}
              >
                {chapter.story.title}
              </h1>

              <h2
                className="text-xl font-semibold"
                style={{ color: settings.textColor, opacity: 0.9 }}
              >
                Chương {chapter.chapter_number}: {chapter.title}
              </h2>

              <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2" style={{ color: settings.textColor, opacity: 0.7 }}>
                  <span>Tác giả:</span>
                  <span className="text-blue-400 font-medium">{chapter.story.author}</span>
                </div>

                <div className="flex items-center gap-2" style={{ color: settings.textColor, opacity: 0.7 }}>
                  <BookOpenIcon className="w-4 h-4" />
                  <span>{chapter.word_count || 0} từ</span>
                </div>

                <div className="flex items-center gap-2" style={{ color: settings.textColor, opacity: 0.7 }}>
                  <ClockIcon className="w-4 h-4" />
                  <span>{formatReadingTime(chapter.word_count)}</span>
                </div>

                <div className="flex items-center gap-2" style={{ color: settings.textColor, opacity: 0.7 }}>
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(chapter.created_at)}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="px-8 py-12 lg:px-16 lg:py-16">
            <div
              className="prose prose-lg max-w-none"
              style={{
                color: settings.textColor,
                fontSize: `${settings.fontSize}px`,
                fontFamily: settings.fontFamily,
                lineHeight: settings.lineHeight
              }}
            >
              <div className="whitespace-pre-line">
                {chapter.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="mb-6 text-justify leading-relaxed">
                      {paragraph}
                    </p>
                  ) : (
                    <div key={index} className="mb-4"></div>
                  )
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between mt-12 gap-4">
          {prevChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/chapters/${prevChapter.slug}`}
              className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#3b82f6', color: 'white' }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Chương trước</span>
            </Link>
          ) : (
            <div></div>
          )}

          <div className="text-center">
            <span className="text-sm font-medium" style={{ color: settings.textColor, opacity: 0.6 }}>
              Chương {chapter.chapter_number}
            </span>
          </div>

          {nextChapter ? (
            <Link
              href={`/stories/${chapter.story.slug}/chapters/${nextChapter.slug}`}
              className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#3b82f6', color: 'white' }}
            >
              <span>Chương tiếp</span>
              <ChevronRightIcon className="w-5 h-5" />
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </main>

      {/* Reading Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 p-4 rounded-full shadow-xl transition-all duration-200 hover:scale-110 border"
        style={{
          backgroundColor: settings.background,
          borderColor: settings.textColor + '30',
          color: settings.textColor
        }}
        title="Cài đặt đọc truyện"
      >
        <AdjustmentsHorizontalIcon className="w-6 h-6" />
      </button>

      {/* Reading Settings Modal */}
      <ReadingSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  )
}
