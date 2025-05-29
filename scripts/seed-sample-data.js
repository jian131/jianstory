#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client với service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function seedSampleData() {
  console.log('🌱 Bắt đầu seed sample data...')

  try {
    // 1. Create sample authors
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .upsert([
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Nguyễn Văn A',
          bio: 'Tác giả truyện tiên hiệp nổi tiếng',
          created_at: new Date().toISOString()
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          name: 'Lê Thị B',
          bio: 'Chuyên viết truyện ngôn tình',
          created_at: new Date().toISOString()
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          name: 'Trần Văn C',
          bio: 'Tác giả truyện kiếm hiệp',
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (authorsError) throw authorsError
    console.log('✅ Created authors:', authors.length)

    // 2. Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .limit(3)

    if (!categories || categories.length === 0) {
      console.log('❌ No categories found. Make sure to run database schema first.')
      return
    }

    // 3. Create sample stories
    const sampleStories = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        title: 'Tu Tiên Độc Tôn',
        slug: 'tu-tien-doc-ton',
        description: 'Một thiếu niên bình thường vô tình được thừa kế di sản của một vị tu sĩ cổ đại...',
        content: 'Nội dung chi tiết của truyện Tu Tiên Độc Tôn...',
        author_id: authors[0].id,
        category_id: categories[0].id,
        status: 'ongoing',
        total_chapters: 0,
        is_featured: true,
        is_published: true,
        published_at: new Date().toISOString(),
        tags: ['tu tiên', 'huyền huyễn', 'xuyên không'],
        metadata: JSON.stringify({ source: 'sample', priority: 1 })
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Hoàng Phi Không Dễ Làm',
        slug: 'hoang-phi-khong-de-lam',
        description: 'Cô ấy là một bác sĩ hiện đại, xuyên việt thành hoàng phi trong cung đình...',
        content: 'Nội dung chi tiết của truyện Hoàng Phi Không Dễ Làm...',
        author_id: authors[1].id,
        category_id: categories[1].id,
        status: 'completed',
        total_chapters: 0,
        is_featured: false,
        is_published: true,
        published_at: new Date().toISOString(),
        tags: ['ngôn tình', 'cổ trang', 'xuyên không'],
        metadata: JSON.stringify({ source: 'sample', priority: 2 })
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        title: 'Thiên Hạ Đệ Nhất Kiếm',
        slug: 'thien-ha-de-nhat-kiem',
        description: 'Trong giang hồ loạn lạc, một thanh niên nông dân quyết tâm luyện kiếm để báo thù...',
        content: 'Nội dung chi tiết của truyện Thiên Hạ Đệ Nhất Kiếm...',
        author_id: authors[2].id,
        category_id: categories[2].id,
        status: 'ongoing',
        total_chapters: 0,
        is_featured: true,
        is_published: true,
        published_at: new Date().toISOString(),
        tags: ['kiếm hiệp', 'võ lâm', 'báo thù'],
        metadata: JSON.stringify({ source: 'sample', priority: 3 })
      }
    ]

    const { data: stories, error: storiesError } = await supabase
      .from('stories')
      .upsert(sampleStories)
      .select()

    if (storiesError) throw storiesError
    console.log('✅ Created stories:', stories.length)

    // 4. Create sample chapters for each story
    const sampleChapters = []

    stories.forEach((story, storyIndex) => {
      for (let i = 1; i <= 5; i++) {
        sampleChapters.push({
          id: `${storyIndex + 1}${storyIndex + 1}${storyIndex + 1}${storyIndex + 1}${storyIndex + 1}${storyIndex + 1}${storyIndex + 1}${storyIndex + 1}-${i.toString().padStart(4, '0')}-4444-4444-444444444444`,
          story_id: story.id,
          title: `Chương ${i}: ${getChapterTitle(story.title, i)}`,
          slug: `chuong-${i}`,
          content: generateChapterContent(story.title, i),
          chapter_number: i,
          word_count: Math.floor(Math.random() * 2000) + 1000,
          view_count: Math.floor(Math.random() * 1000),
          is_published: true,
          published_at: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    })

    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .upsert(sampleChapters)
      .select()

    if (chaptersError) throw chaptersError
    console.log('✅ Created chapters:', chapters.length)

    // 5. Create sample admin user in profiles (if doesn't exist)
    const adminEmail = process.env.ADMIN_EMAILS || 'admin@jianstory.com'

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single()

    if (!existingProfile) {
      console.log(`👤 Tạo admin profile cho email: ${adminEmail}`)
      console.log('⚠️  Lưu ý: Bạn cần đăng ký tài khoản với email này qua Supabase Auth trước')
    } else {
      // Update role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', adminEmail)

      if (updateError) {
        console.log('❌ Error updating admin role:', updateError)
      } else {
        console.log('✅ Updated admin role for:', adminEmail)
      }
    }

    // 6. Update story stats
    for (const story of stories) {
      const { data: storyChapters } = await supabase
        .from('chapters')
        .select('word_count')
        .eq('story_id', story.id)
        .eq('is_published', true)

      const totalChapters = storyChapters?.length || 0
      const totalWords = storyChapters?.reduce((sum, ch) => sum + (ch.word_count || 0), 0) || 0

      await supabase
        .from('stories')
        .update({
          total_chapters: totalChapters,
          total_words: totalWords,
          view_count: Math.floor(Math.random() * 5000) + 1000,
          like_count: Math.floor(Math.random() * 500) + 50,
          rating_average: (Math.random() * 2 + 3).toFixed(2), // 3.0 - 5.0
          rating_count: Math.floor(Math.random() * 100) + 10
        })
        .eq('id', story.id)
    }

    console.log('✅ Updated story statistics')

    console.log('\n🎉 SEED HOÀN THÀNH!')
    console.log('📊 Thống kê:')
    console.log(`   📚 Stories: ${stories.length}`)
    console.log(`   📄 Chapters: ${chapters.length}`)
    console.log(`   👥 Authors: ${authors.length}`)
    console.log(`   🏷️  Categories: ${categories.length}`)
    console.log('\n💡 Bước tiếp theo:')
    console.log('   1. Đăng ký tài khoản với email admin')
    console.log('   2. Truy cập http://localhost:3000')
    console.log('   3. Test comment và rating system!')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

function getChapterTitle(storyTitle, chapterNumber) {
  const titles = {
    'Tu Tiên Độc Tôn': [
      'Khởi Đầu Tu Luyện',
      'Gặp Gỡ Thần Bí',
      'Đột Phá Cảnh Giới',
      'Thử Thách Đầu Tiên',
      'Sức Mạnh Mới'
    ],
    'Hoàng Phi Không Dễ Làm': [
      'Xuyên Việt Đến Cung Đình',
      'Gặp Gỡ Hoàng Thượng',
      'Âm Mưu Trong Cung',
      'Đấu Trí Hoàng Hậu',
      'Tình Yêu Bắt Đầu'
    ],
    'Thiên Hạ Đệ Nhất Kiếm': [
      'Gia Tộc Bị Diệt',
      'Bắt Đầu Luyện Kiếm',
      'Sư Phụ Thần Bí',
      'Đệ Nhất Đối Thủ',
      'Kiếm Pháp Tuyệt Thế'
    ]
  }

  const storyTitles = titles[storyTitle] || [
    'Bắt Đầu Hành Trình',
    'Thử Thách Đầu Tiên',
    'Gặp Gỡ Định Mệnh',
    'Đột Phá Giới Hạn',
    'Sức Mạnh Mới'
  ]

  return storyTitles[chapterNumber - 1] || `Chương ${chapterNumber}`
}

function generateChapterContent(storyTitle, chapterNumber) {
  const templates = {
    'Tu Tiên Độc Tôn': [
      `Thiếu niên Lý Phong nhìn lên bầu trời đêm đầy sao, trong lòng dâng lên một cảm giác kỳ lạ. Từ khi nhặt được cuốn bí kíp cổ ấy, cuộc đời anh đã hoàn toàn thay đổi.\n\n"Tu tiên chi đạo, nghịch thiên nhi hành..." Anh thầm niệm câu thần chú trong cuốn bí kíp, cảm nhận dòng khí linh khí đang dần dần tích tụ trong đan điền.\n\nBỗng nhiên, một ánh sáng kỳ lạ xuất hiện từ phía xa...`,

      `Buổi sáng hôm sau, Lý Phong tỉnh dậy với cảm giác như toàn thân đều tràn đầy sức mạnh. Đêm qua, anh đã chính thức bước vào giai đoạn Luyện Khí đầu tầng.\n\n"Không ngờ cuốn bí kíp này lại có thể giúp ta tu luyện nhanh đến vậy," anh tự nhủ trong lòng.\n\nNhưng anh không biết rằng, cuốn bí kíp ấy đã thu hút sự chú ý của những thế lực khác...`,

      `"Ngươi là ai? Tại sao lại có khí tức của Thần Ma Kinh?" Một giọng nói lạnh lùng vang lên từ phía sau.\n\nLý Phong quay phắt người lại, thấy một lão giả áo đen đang nhìn mình với ánh mắt sắc bén như kiếm.\n\n"Ta chính là truyền nhân của Thần Ma Tôn Giả. Ngươi có duyên được thừa kế di sản của ta, nhưng cũng phải chịu trách nhiệm tương ứng..."`
    ],

    'Hoàng Phi Không Dễ Làm': [
      `Bác sĩ Châu Tuyết khi mở mắt ra, thấy mình đang nằm trong một căn phòng trang trí cổ điển. Trang phục trên người cũng hoàn toàn khác lạ.\n\n"Đây là đâu?" Cô ngồi dậy, cảm thấy đầu còn hơi choáng váng. Ký ức cuối cùng là cô đang mổ cấp cứu cho một bệnh nhân, rồi bỗng nhiên có tiếng nổ lớn...\n\nBỗng nhiên, có tiếng chân người bước vào: "Nương nương, hoàng thượng đã đến!"`,

      `"Phi tần Châu Tuyết tiếp giá hoàng thượng," cô nàng cúi đầu chào theo lễ nghi cung đình mà các cung nữ đã dạy.\n\nNhững hoàng đế trước mặt cao to, tuấn tú, nhưng đôi mắt lại lạnh lùng như băng giá. Đây chính là Đông Phương Dật, hoàng đế của Đại Chu quốc.\n\n"Ngươi có khác lạ," Đông Phương Dật nhìn cô với ánh mắt thăm dò. "Ngươi không giống như trước đây..."`,

      `Trong cung điện tráng lệ, Châu Tuyết đang cố gắng thích nghi với cuộc sống mới. Cô biết rằng, thân phận hoàng phi này không hề đơn giản.\n\n"Nương nương cẩn thận, hoàng hậu đã gửi người đến rồi," Tiểu Lan, cung nữ thân tín thì thầm báo cáo.\n\nChâu Tuyết mỉm cười. Với kiến thức y học hiện đại và trí tuệ của mình, cô sẽ khiến những người này phải ngạc nhiên...`
    ]
  }

  const storyTemplates = templates[storyTitle] || [
    `Câu chuyện bắt đầu trong một ngày bình thường...`,
    `Nhân vật chính đối mặt với thử thách đầu tiên...`,
    `Những bí mật dần được hé lộ...`
  ]

  return storyTemplates[chapterNumber - 1] || `Nội dung chương ${chapterNumber} của ${storyTitle}.\n\nĐây là một chương thú vị với nhiều tình tiết hấp dẫn và phát triển nhân vật sâu sắc.`
}

// Run the seed function
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log('\n✅ Seed completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Seed failed:', error)
      process.exit(1)
    })
}

module.exports = { seedSampleData }
