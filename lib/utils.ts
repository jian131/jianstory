import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date to Vietnamese
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format reading time
export function formatReadingTime(wordCount: number): string {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} phút đọc`
}

// Format view count
export function formatViewCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

// Slugify text for URL
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Extract story ID from slug
export function extractStoryId(slug: string): number | null {
  const match = slug.match(/-(\d+)$/)
  return match ? parseInt(match[1]) : null
}

// Generate Cloudinary URL
export function getCloudinaryUrl(publicId: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName) return ''

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`

  if (!options) {
    return `${baseUrl}/${publicId}`
  }

  const transformations = []
  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)
  if (options.quality) transformations.push(`q_${options.quality}`)
  if (options.format) transformations.push(`f_${options.format}`)

  const transform = transformations.length > 0 ? `${transformations.join(',')}/` : ''
  return `${baseUrl}/${transform}${publicId}`
}
