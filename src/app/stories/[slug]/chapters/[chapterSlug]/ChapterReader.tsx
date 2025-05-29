'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ReadingSettings from '@/components/ReadingSettings'
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
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
  background: '#1f2937',
  textColor: '#f9fafb',
  theme: 'dark'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

function formatReadingTime(wordCount: number): string {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} phút đọc`
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
        <nav className="mb-6">
          <ol
            className="flex items-center space-x-2 text-sm opacity-70"
            style={{ color: settings.textColor }}
          >
            <li><Link href="/" className="hover:text-blue-400 transition-colors">Trang chủ</Link></li>
            <li>/</li>
            <li><Link href={`/stories/${chapter.story.slug}`} className="hover:text-blue-400 transition-colors">{chapter.story.title}</Link></li>
            <li>/</li>
            <li className="opacity-100">Chương {chapter.chapter_number}</li>
          </ol>
        </nav>

        {/* Navigation */}
        <nav className="flex items-center justify-between mb-6">
          <div>
            {prevChapter ? (
              <Link
                href={`/stories/${chapter.story.slug}/chapters/${prevChapter.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg border transition-all hover:scale-105"
                style={{
                  borderColor: settings.textColor + '30',
                  color: settings.textColor,
                  backgroundColor: settings.background
                }}
              >
                ← Chương {prevChapter.chapter_number}
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          <div className="text-center">
            <Link
              href={`/stories/${chapter.story.slug}`}
              className="inline-flex items-center px-4 py-2 rounded-lg border transition-all hover:scale-105"
              style={{
                borderColor: settings.textColor + '30',
                color: settings.textColor,
                backgroundColor: settings.background
              }}
            >
              📚 Về trang truyện
            </Link>
          </div>

          <div>
            {nextChapter ? (
              <Link
                href={`/stories/${chapter.story.slug}/chapters/${nextChapter.slug}`}
                className="inline-flex items-center px-4 py-2 rounded-lg border transition-all hover:scale-105"
                style={{
                  borderColor: settings.textColor + '30',
                  color: settings.textColor,
                  backgroundColor: settings.background
                }}
              >
                Chương {nextChapter.chapter_number} →
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </nav>

        {/* Chapter Content */}
        <article
          className="rounded-xl shadow-2xl overflow-hidden border"
          style={{
            backgroundColor: settings.background,
            borderColor: settings.textColor + '20'
          }}
        >
          <header
            className="px-6 py-6 border-b"
            style={{
              backgroundColor: settings.textColor + '05',
              borderColor: settings.textColor + '20'
            }}
          >
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: settings.textColor }}
            >
              {chapter.story.title}
            </h1>
            <h2
              className="text-xl mb-3"
              style={{ color: settings.textColor, opacity: 0.8 }}
            >
              Chương {chapter.chapter_number}: {chapter.title}
            </h2>
            <div
              className="flex items-center text-sm flex-wrap gap-4"
              style={{ color: settings.textColor, opacity: 0.6 }}
            >
              <span>Tác giả: <span className="text-blue-400">{chapter.story.author}</span></span>
              <span>•</span>
              <span>{chapter.word_count || 0} từ</span>
              <span>•</span>
              <span>{formatReadingTime(chapter.word_count)}</span>
              <span>•</span>
              <span>{formatDate(chapter.created_at)}</span>
            </div>
          </header>

          <div className="px-6 py-8 lg:px-12 lg:py-12">
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
                    <p key={index} className="mb-6 text-justify">
                      {paragraph}
                    </p>
                  ) : (
                    <br key={index} />
                  )
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Bottom navigation */}
        <nav className="flex items-center justify-between mt-8">
          <div>
            {prevChapter ? (
              <Link
                href={`/stories/${chapter.story.slug}/chapters/${prevChapter.slug}`}
                className="inline-flex items-center px-6 py-3 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }}
              >
                ← Chương trước
              </Link>
            ) : (
              <div></div>
            )}
          </div>

          <div className="text-center">
            <span
              className="text-sm"
              style={{ color: settings.textColor, opacity: 0.6 }}
            >
              Chương {chapter.chapter_number} / {chapter.story.title}
            </span>
          </div>

          <div>
            {nextChapter ? (
              <Link
                href={`/stories/${chapter.story.slug}/chapters/${nextChapter.slug}`}
                className="inline-flex items-center px-6 py-3 rounded-lg transition-all hover:scale-105"
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white'
                }}
              >
                Chương tiếp →
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        </nav>
      </main>

      {/* Reading Settings Button */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 p-3 rounded-full shadow-lg transition-all hover:scale-110"
        style={{
          backgroundColor: settings.background,
          borderColor: settings.textColor + '30',
          color: settings.textColor,
          border: '1px solid'
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
