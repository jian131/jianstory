// Format view count
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Format reading time
export function formatReadingTime(wordCount: number): string {
  const WORDS_PER_MINUTE = 200 // Tốc độ đọc trung bình
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)

  if (minutes < 1) {
    return '< 1 phút'
  }

  return `${minutes} phút đọc`
}

// Get Cloudinary URL
export function getCloudinaryUrl(publicId: string, options: {
  width?: number
  height?: number
  quality?: number | string
  format?: string
  crop?: string
} = {}): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName || !publicId) return '/placeholder-book.jpg'

  const defaultOptions = {
    width: 400,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  }

  const finalOptions = { ...defaultOptions, ...options }

  // Tạo chuỗi transformation
  const transformations = [
    `w_${finalOptions.width}`,
    `h_${finalOptions.height}`,
    `c_${finalOptions.crop}`,
    `q_${finalOptions.quality}`,
    `f_${finalOptions.format}`
  ].join(',')

  // Tạo URL với format mới
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`
}
