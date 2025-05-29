'use client'

interface ChapterContentProps {
  content: string
}

export default function ChapterContent({ content }: ChapterContentProps) {
  // Process content to ensure proper formatting
  const processContent = (rawContent: string) => {
    // If content already has HTML tags, use as is
    if (rawContent.includes('<p>') || rawContent.includes('<br>')) {
      return rawContent
    }

    // If plain text, convert line breaks to HTML
    return rawContent
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('')
  }

  const processedContent = processContent(content)

  return (
    <div
      className="prose prose-lg prose-gray max-w-none chapter-text"
      style={{
        fontSize: '18px',
        lineHeight: '1.8',
        fontFamily: 'inherit'
      }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
