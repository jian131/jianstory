#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { v2: cloudinary } = require('cloudinary');

// Load environment variables from project root
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Configure Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Variables Check:');
console.log('  SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('  SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Loaded' : '❌ Missing');
console.log('  CLOUDINARY_CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Loaded' : '❌ Missing');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function slugify(text) {
  if (!text || typeof text !== 'string') {
    return 'unknown';
  }

  return text
    .toLowerCase()
    .trim()
    // Remove Vietnamese diacritics
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Replace special characters
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_-]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 50);
}

function createUniqueChapterSlug(title, chapterNumber, storySlug) {
  const baseSlug = slugify(title);

  // If title is empty or results in empty slug, use chapter number
  if (!baseSlug || baseSlug === 'unknown') {
    return `${storySlug}-chuong-${chapterNumber}`;
  }

  // Create unique slug with chapter number
  return `${baseSlug}-${chapterNumber}`;
}

async function uploadImageToCloudinary(imagePath, publicId) {
  try {
    console.log(`  📤 Uploading ${imagePath} to Cloudinary...`);

    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: 'jianstory/covers',
      format: 'webp',
      quality: 'auto:good',
      width: 400,
      height: 600,
      crop: 'fill',
      gravity: 'auto',
    });

    console.log(`  ✅ Uploaded to Cloudinary: ${result.public_id}`);
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error) {
    console.error(`  ❌ Error uploading to Cloudinary:`, error);
    return null;
  }
}

async function importStory(storyDir) {
  try {
    console.log(`\n📚 Processing story: ${path.basename(storyDir)}`);

    // Read story info
    const infoPath = path.join(storyDir, 'story_info_FINAL.json');
    const infoExists = await fs.access(infoPath).then(() => true).catch(() => false);

    if (!infoExists) {
      console.log(`  ❌ No story_info_FINAL.json found in ${storyDir}`);
      return false;
    }

    const storyInfo = JSON.parse(await fs.readFile(infoPath, 'utf8'));
    const storySlug = slugify(storyInfo.title);

    console.log(`  📖 Title: ${storyInfo.title}`);
    console.log(`  ✍️  Author: ${storyInfo.author}`);
    console.log(`  📄 Chapters: ${storyInfo.chapters?.length || 0}`);

    // Upload cover image to Cloudinary
    let coverData = null;
    const coverPath = path.join(storyDir, 'cover.jpg');
    const coverExists = await fs.access(coverPath).then(() => true).catch(() => false);

    if (coverExists) {
      const publicId = `story-${storySlug}-cover`;
      coverData = await uploadImageToCloudinary(coverPath, publicId);
    } else {
      console.log('  ⚠️ No cover image found');
    }

    // Check if story exists
    const { data: existingStory } = await supabase
      .from('stories')
      .select('id, slug')
      .eq('slug', storySlug)
      .single();

    const storyData = {
      title: storyInfo.title,
      slug: storySlug,
      description: storyInfo.description || `Truyện ${storyInfo.title} của tác giả ${storyInfo.author}`,
      author: storyInfo.author,
      cover_image: coverData?.secure_url || null,
      cloudinary_public_id: coverData?.public_id || null,
      status: 'ongoing',
      source_url: storyInfo.url,
      tags: [], // Will be populated later if needed
    };

    let story;
    if (existingStory) {
      console.log(`  📝 Updating existing story with ID: ${existingStory.id}`);
      const { data: updatedStory, error: updateError } = await supabase
        .from('stories')
        .update(storyData)
        .eq('id', existingStory.id)
        .select()
        .single();

      if (updateError) {
        console.error(`  ❌ Error updating story:`, updateError);
        return false;
      }
      story = updatedStory;

      // Delete existing chapters
      const { error: deleteError } = await supabase
        .from('chapters')
        .delete()
        .eq('story_id', existingStory.id);

      if (deleteError) {
        console.error(`  ❌ Error deleting existing chapters:`, deleteError);
        return false;
      }
      console.log(`  🗑️ Deleted existing chapters`);
    } else {
      console.log(`  ➕ Creating new story`);
      const { data: newStory, error: insertError } = await supabase
        .from('stories')
        .insert(storyData)
        .select()
        .single();

      if (insertError) {
        console.error(`  ❌ Error inserting story:`, insertError);
        return false;
      }
      story = newStory;
    }

    console.log(`  ✅ Story ${existingStory ? 'updated' : 'inserted'} with ID: ${story.id}`);

    // Insert chapters
    if (storyInfo.chapters && storyInfo.chapters.length > 0) {
      console.log(`  📖 Inserting ${storyInfo.chapters.length} chapters...`);

      for (let i = 0; i < storyInfo.chapters.length; i++) {
        const chapter = storyInfo.chapters[i];
        const chapterSlug = createUniqueChapterSlug(chapter.title, i + 1, storySlug);

        // Calculate word count
        const wordCount = chapter.content ? chapter.content.split(/\s+/).length : 0;

        const { error: chapterError } = await supabase
          .from('chapters')
          .insert({
            story_id: story.id,
            chapter_number: i + 1,
            title: chapter.title,
            slug: chapterSlug,
            content: chapter.content,
            word_count: wordCount,
          });

        if (chapterError) {
          console.error(`    ❌ Error inserting chapter ${i + 1}:`, chapterError);
        } else {
          console.log(`    ✅ Chapter ${i + 1}: ${chapter.title}`);
        }
      }
    }

    console.log(`  🎉 Story import completed!`);
    return true;

  } catch (error) {
    console.error(`  ❌ Error importing story:`, error);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 Starting story import process...');

    // Check if stories directory exists
    const storiesDir = path.join(process.cwd(), '..', 'stories');
    const storiesDirExists = await fs.access(storiesDir).then(() => true).catch(() => false);

    if (!storiesDirExists) {
      console.log('❌ Stories directory not found. Please run the crawler first.');
      return;
    }

    // Get all story directories
    const items = await fs.readdir(storiesDir, { withFileTypes: true });
    const storyDirs = items
      .filter(item => item.isDirectory())
      .map(item => path.join(storiesDir, item.name));

    if (storyDirs.length === 0) {
      console.log('❌ No story directories found.');
      return;
    }

    console.log(`📁 Found ${storyDirs.length} story directories`);

    // Process each story
    let successCount = 0;
    for (const storyDir of storyDirs) {
      const success = await importStory(storyDir);
      if (success) successCount++;
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Successfully imported: ${successCount}/${storyDirs.length} stories`);

  } catch (error) {
    console.error('❌ Error in main process:', error);
  }
}

// Handle command line arguments
if (process.argv.length > 2) {
  const targetStory = process.argv[2];
  const storyPath = path.join(process.cwd(), '..', 'stories', targetStory);

  console.log(`🎯 Importing specific story: ${targetStory}`);
  importStory(storyPath);
} else {
  main();
}
