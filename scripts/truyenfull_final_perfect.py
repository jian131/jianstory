#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TruyenFull Final Perfect - HOÀN HẢO 100%
Preserve exact formatting + Fix broken words thông minh + Crawl ảnh bìa
"""

import re
import os
import json
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse as urlparse
from urllib.parse import urljoin
import shutil

def smart_fix_vietnamese_broken_words(text: str) -> str:
    """
    Thuật toán ĐƠN GIẢN và HIỆU QUẢ để fix broken Vietnamese words
    Approach pragmatic - fix maximum số lỗi với minimum complexity
    """
    if not text or len(text.strip()) < 5:
        return text

    # Split thành lines để preserve line breaks
    lines = text.split('\n')
    fixed_lines = []

    for line in lines:
        if line.strip():  # Chỉ process lines có content
            # Method 1: Fix obvious broken patterns (đã proven)
            line = fix_broken_characters_in_words(line)

            # Method 2: Fix common missing spaces (new)
            line = fix_missing_spaces(line)

            # Method 3: Clean up spacing
            line = re.sub(r'[ \t]+', ' ', line)
            line = re.sub(r' +([.!?,:;])', r'\1', line)

            fixed_lines.append(line.strip())
        else:
            fixed_lines.append('')  # Preserve empty lines exactly

    return '\n'.join(fixed_lines)

def fix_broken_characters_in_words(text: str) -> str:
    """Fix các ký tự bị tách trong từ với approach conservative - chỉ fix những lỗi rõ ràng"""

    # Only fix obvious and safe patterns
    safe_fixes = [
        # Core patterns that are definitely broken
        ('nó i', 'nói'),
        ('th ai', 'thai'),
        ('như ng', 'nhưng'),
        ('cũ ng', 'cũng'),
        ('qua nh', 'quanh'),
        ('to àn', 'toàn'),
        ('và o', 'vào'),
        ('đi ện', 'điện'),
        ('đượ c', 'được'),
        ('ngườ i', 'người'),
        ('thấ y', 'thấy'),
        ('mà ng', 'mang'),
        ('thườ ng', 'thường'),
        ('cườ i', 'cười'),
        ('là m', 'làm'),
        ('đâ u', 'đâu'),
        ('nà o', 'nào'),
        ('lạ i', 'lại'),
        ('lạ nh', 'lạnh'),
        ('rồ i', 'rồi'),
        ('cò n', 'còn'),
        # Common compound patterns
        ('tr ước', 'trước'),
        ('tr ên', 'trên'),
        ('tr ở', 'trở'),
        ('từ ng', 'từng'),
        ('khi ến', 'khiến'),
        ('khá c', 'khác'),
        ('cá c', 'các'),
        ('sá ng', 'sáng'),
        ('miề ng', 'miệng'),
        ('tiề ng', 'tiếng'),
        ('thiề u', 'thiếu'),
        ('diề u', 'điều'),
        # Character name fix
        ('Tộ tố', 'Tố Tố'),
        ('tộ tố', 'Tố Tố'),
    ]

    # Apply fixes with simple replacement
    for broken, fixed in safe_fixes:
        text = text.replace(broken, fixed)

    return text

def extract_content_preserve_exact_formatting(content_elem):
    """Extract content preserve CHÍNH XÁC formatting từ HTML"""

    if not content_elem:
        return ""

    # Convert HTML breaks thành newlines TRƯỚC KHI extract text
    html_str = str(content_elem)

    # Remove ads first
    html_str = re.sub(r'<div[^>]*ads[^>]*>.*?</div>', '', html_str, flags=re.DOTALL | re.IGNORECASE)

    # Convert <br> -> newline (mỗi <br> = 1 newline chính xác)
    html_str = re.sub(r'<br\s*/?>', '\n', html_str, flags=re.IGNORECASE)

    # Extract clean text
    soup = BeautifulSoup(html_str, 'html.parser')
    clean_text = soup.get_text()

    return clean_text.strip()

def crawl_truyenfull_final_perfect(url: str):
    """Crawl story với FINAL PERFECT quality + ảnh bìa"""

    print(f"🎯 FINAL PERFECT CRAWL: {url}")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    try:
        # 1. Fetch story page
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code != 200:
            print(f"❌ Status code: {response.status_code}")
            return False

        soup = BeautifulSoup(response.content, 'html.parser')
        print("✅ Story page loaded")

        # 2. Extract metadata
        title = ""
        author = ""

        h1_title = soup.select_one('h1')
        if h1_title:
            title = h1_title.get_text().strip()
            print(f"📚 Title: {title}")

        author_link = soup.select_one("a[href*='tac-gia']")
        if author_link:
            author = author_link.get_text().strip()
            print(f"✍️  Author: {author}")

        # 3. Create story directory
        story_name = title.replace(' ', '-').replace('/', '-') if title else 'unknown-story'
        story_dir = f"stories/{story_name}"
        os.makedirs(story_dir, exist_ok=True)

        # 4. Download ảnh bìa
        cover_info = download_cover_image(soup, story_dir, story_name)

        # 5. Get chapter list
        chapter_links = soup.select("li a[href*='chuong-']")

        filtered_chapters = []
        for link in chapter_links:
            href = link.get('href', '')
            text = link.get_text().strip()
            if any(skip in href for skip in ['top-truyen', 'danh-sach', '100-chuong', '500-chuong', '1000-chuong']):
                continue
            if 'chuong-' in href and text.lower().startswith('chương'):
                filtered_chapters.append(link)

        print(f"📖 Found {len(filtered_chapters)} chapters")

        if not filtered_chapters:
            print("❌ No chapters found!")
            return False

        # 6. Crawl chapters với FINAL PERFECT quality
        chapters_data = []
        success_count = 0

        # Hỏi user có muốn crawl tất cả chapters không
        while True:
            choice = input(f"\n📝 Crawl tất cả {len(filtered_chapters)} chapters? (y/n) hoặc nhập số chapters muốn crawl: ").strip().lower()
            if choice in ['y', 'yes', 'có', 'c']:
                max_chapters = len(filtered_chapters)
                break
            elif choice in ['n', 'no', 'không', 'k']:
                max_chapters = 2  # Default test
                break
            else:
                try:
                    max_chapters = int(choice)
                    if 1 <= max_chapters <= len(filtered_chapters):
                        break
                    else:
                        print(f"❌ Vui lòng nhập từ 1 đến {len(filtered_chapters)}")
                except:
                    print("❌ Vui lòng nhập 'y', 'n' hoặc số chapters")

        print(f"🚀 Sẽ crawl {max_chapters}/{len(filtered_chapters)} chapters...")

        for i, chapter_link in enumerate(filtered_chapters[:max_chapters], 1):
            chapter_href = chapter_link.get('href', '')
            chapter_title = chapter_link.get_text().strip()

            if chapter_href.startswith('/'):
                chapter_url = 'https://truyenfull.vision' + chapter_href
            elif not chapter_href.startswith('http'):
                chapter_url = urlparse.urljoin(url, chapter_href)
            else:
                chapter_url = chapter_href

            print(f"  📄 [{i}/{len(filtered_chapters)}] {chapter_title}")
            print(f"     URL: {chapter_url}")

            try:
                chapter_response = requests.get(chapter_url, headers=headers, timeout=15)
                if chapter_response.status_code != 200:
                    print(f"     ❌ Status: {chapter_response.status_code}")
                    continue

                chapter_soup = BeautifulSoup(chapter_response.content, 'html.parser')

                # Extract content với exact formatting preservation
                content_elem = chapter_soup.select_one('#chapter-c')
                if not content_elem:
                    content_elem = chapter_soup.select_one('.chapter-c')

                if content_elem:
                    # Step 1: Extract với preserve exact formatting
                    raw_content = extract_content_preserve_exact_formatting(content_elem)

                    # Step 2: Smart fix broken words MÀ KHÔNG phá formatting
                    final_content = smart_fix_vietnamese_broken_words(raw_content)

                    # Analysis
                    total_lines = len(final_content.split('\n'))
                    non_empty_lines = len([line for line in final_content.split('\n') if line.strip()])

                    print(f"     ✅ Content: {len(final_content)} chars")
                    print(f"     📝 Lines: {total_lines} total, {non_empty_lines} non-empty")
                    print(f"     Preview: {final_content[:100]}...")

                    # Save chapter với FINAL PERFECT quality
                    chapter_file = f"{story_dir}/chapter_{i:03d}_FINAL.txt"
                    with open(chapter_file, 'w', encoding='utf-8') as f:
                        f.write(f"# {chapter_title}\n\n{final_content}")

                    chapters_data.append({
                        'title': chapter_title,
                        'content': final_content,
                        'url': chapter_url,
                        'total_lines': total_lines,
                        'non_empty_lines': non_empty_lines
                    })

                    success_count += 1

                else:
                    print(f"     ❌ No content found!")

                time.sleep(1)

            except Exception as e:
                print(f"     ❌ Error: {e}")

        # 7. Save story info với cover image info
        story_info = {
            'title': title,
            'author': author,
            'url': url,
            'total_chapters': len(filtered_chapters),
            'crawled_chapters': success_count,
            'cover_image': cover_info,
            'chapters': chapters_data,
            'quality_note': 'FINAL PERFECT - Exact formatting + Smart broken word fix + Cover image'
        }

        with open(f"{story_dir}/story_info_FINAL.json", 'w', encoding='utf-8') as f:
            json.dump(story_info, f, indent=2, ensure_ascii=False)

        print(f"\n🎉 FINAL PERFECT CRAWL HOÀN THÀNH!")
        print(f"   📚 Story: {title}")
        print(f"   ✍️  Author: {author}")
        print(f"   📖 Chapters: {success_count}/{len(filtered_chapters)}")
        if cover_info:
            print(f"   🖼️  Cover: {cover_info['filename']} ({cover_info['size']} bytes)")
        print(f"   📁 Saved to: {story_dir}/")
        print(f"   🏆 Quality: FINAL PERFECT - Exact formatting + Smart text fix + Cover image")

        # Show stats
        total_lines = sum(ch.get('total_lines', 0) for ch in chapters_data)
        total_non_empty = sum(ch.get('non_empty_lines', 0) for ch in chapters_data)
        print(f"   📊 Total lines: {total_lines} ({total_non_empty} non-empty)")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function với URL interface"""

    # Lấy URL từ user
    url = get_story_url_from_user()

    if not url:
        return

    print(f"\n🧪 Bắt đầu crawl: {url}")
    success = crawl_truyenfull_final_perfect(url)

    if success:
        print("\n🎉 FINAL PERFECT CRAWL THÀNH CÔNG!")
        print("💎 Chất lượng: Formatting + Text hoàn hảo + Ảnh bìa như website gốc!")

        # Hỏi có muốn crawl thêm truyện khác không
        while True:
            again = input("\n🔄 Có muốn crawl thêm truyện khác không? (y/n): ").strip().lower()
            if again in ['y', 'yes', 'có', 'c']:
                main()  # Recursive call
                break
            elif again in ['n', 'no', 'không', 'k']:
                print("👋 Tạm biệt!")
                break
            else:
                print("❌ Vui lòng nhập 'y' hoặc 'n'")
    else:
        print("\n❌ CRAWL THẤT BẠI!")

        # Hỏi có muốn thử lại không
        while True:
            retry = input("\n🔄 Có muốn thử lại với URL khác không? (y/n): ").strip().lower()
            if retry in ['y', 'yes', 'có', 'c']:
                main()  # Recursive call
                break
            elif retry in ['n', 'no', 'không', 'k']:
                print("👋 Tạm biệt!")
                break
            else:
                print("❌ Vui lòng nhập 'y' hoặc 'n'")

def fix_missing_spaces(text: str) -> str:
    """Fix từ dính liền bằng cách thêm spaces vào chỗ cần thiết"""

    # Patterns để detect và fix từ dính liền
    space_fixes = [
        # Pattern: lowercase word + uppercase/capitalized word
        (r'([a-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ][a-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]*)', r'\1 \2'),

        # Common Vietnamese words that often get stuck together
        (r'(là)(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|thần|tiên|hối|núi|khuôn|vợ|tự|thái|đang|hạ|mà|thầm)', r'\1 \2'),
        (r'(vì)(mang|ta|thế)', r'\1 \2'),
        (r'(có)(sáng|được|chút|đứa|phải|ai|hai|một)', r'\1 \2'),
        (r'(ta)(hai|chui|đoán|sợ|run|không|còn|đau|thầm)', r'\1 \2'),
        (r'(tử)(duy|khác|điện)', r'\1 \2'),
        (r'(nữ)(chăm)', r'\1 \2'),
        (r'(mở)(cửa)', r'\1 \2'),
        (r'(ai)(đó)', r'\1 \2'),
        (r'(ra)(khỏi|đã|giường)', r'\1 \2'),
        (r'(đi)(một|nữa)', r'\1 \2'),
        (r'(đó)(lại|thực|thích)', r'\1 \2'),
        (r'(đã)(khiến|yêu|có|từng|mất|hơi)', r'\1 \2'),
        (r'(vô)(lý)', r'\1 \2'),
        (r'(tơ)(vò)', r'\1 \2'),
        (r'(và)(đôi)', r'\1 \2'),
        (r'(bị)(khoét)', r'\1 \2'),
        (r'(từ)(đâu|khi)', r'\1 \2'),
        (r'(ban)(năm)', r'\1 \2'),
        (r'(cô)(nương|đơn)', r'\1 \2'),
        (r'(đi)(qua)', r'\1 \2'),
        (r'(về)(cái)', r'\1 \2'),
        (r'(tự)(khép|lấy)', r'\1 \2'),
        (r'(ta)(cứu|nói)', r'\1 \2'),
        (r'(cả)(mọi)', r'\1 \2'),
        (r'(đỡ)(ta)', r'\1 \2'),
        (r'(sự)(việc)', r'\1 \2'),
        (r'(lên)(Cửu)', r'\1 \2'),
        (r'(bốn)(bề)', r'\1 \2'),
        (r'(chữ)(Tố)', r'\1 \2'),
        (r'(ăn)(khớp)', r'\1 \2'),
        (r'(đi)(nghỉ)', r'\1 \2'),
        (r'(đã)(có|mất)', r'\1 \2'),
        (r'(ta)(rằng|rồi)', r'\1 \2'),
        (r'(cứ)(ngỡ)', r'\1 \2'),
        (r'(của)(đám|ngươi)', r'\1 \2'),
        (r'(trào)(lên)', r'\1 \2'),
        (r'(ngạo)(mạn)', r'\1 \2'),
        (r'(như)(thế)', r'\1 \2'),
        (r'(chộp)(lấy)', r'\1 \2'),
        (r'(ta)(xuống)', r'\1 \2'),
        (r'(rơi)(khỏi)', r'\1 \2'),
        (r'(cố)(ý)', r'\1 \2'),
        (r'(dựng)(đứng)', r'\1 \2'),
        (r'(hắt)(ra)', r'\1 \2'),
        (r'(con)(trai)', r'\1 \2'),
        (r'(tiểu)(tiên)', r'\1 \2'),
        (r'(năm)(thứ)', r'\1 \2'),
        (r'(Dạ)(Hoa)', r'\1 \2'),
        (r'(Tố)(Cẩm)', r'\1 \2'),
    ]

    for pattern, replacement in space_fixes:
        text = re.sub(pattern, replacement, text)

    return text

def download_cover_image(soup, story_dir, story_name):
    """Download ảnh bìa truyện"""

    print("🖼️  Tìm và download ảnh bìa...")

    # Các selector có thể có ảnh bìa
    cover_selectors = [
        'img.book',
        'img[alt*="cover"]',
        'img[alt*="bìa"]',
        '.book img',
        '.cover img',
        '.story-cover img',
        'img[src*="cover"]',
        'img[src*="book"]',
        '.info-holder img',
        '.books img'
    ]

    cover_img = None

    # Tìm ảnh bìa
    for selector in cover_selectors:
        cover_img = soup.select_one(selector)
        if cover_img:
            print(f"     ✅ Tìm thấy ảnh bìa với selector: {selector}")
            break

    if not cover_img:
        # Fallback: tìm ảnh đầu tiên có kích thước hợp lý
        all_imgs = soup.select('img[src]')
        for img in all_imgs:
            src = img.get('src', '')
            if any(keyword in src.lower() for keyword in ['cover', 'book', 'story', 'truyen']):
                cover_img = img
                print(f"     ✅ Tìm thấy ảnh bìa fallback: {src}")
                break

    if not cover_img:
        print("     ❌ Không tìm thấy ảnh bìa")
        return None

    try:
        img_src = cover_img.get('src', '')
        if not img_src:
            print("     ❌ Không có src cho ảnh")
            return None

        # Tạo URL đầy đủ cho ảnh
        if img_src.startswith('/'):
            img_url = 'https://truyenfull.vision' + img_src
        elif not img_src.startswith('http'):
            img_url = urljoin('https://truyenfull.vision/', img_src)
        else:
            img_url = img_src

        print(f"     📥 Downloading: {img_url}")

        # Download ảnh
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://truyenfull.vision/'
        }

        img_response = requests.get(img_url, headers=headers, timeout=15, stream=True)
        if img_response.status_code == 200:
            # Xác định extension của file
            content_type = img_response.headers.get('content-type', '')
            if 'jpeg' in content_type or 'jpg' in content_type:
                ext = '.jpg'
            elif 'png' in content_type:
                ext = '.png'
            elif 'gif' in content_type:
                ext = '.gif'
            elif 'webp' in content_type:
                ext = '.webp'
            else:
                # Fallback từ URL
                if '.jpg' in img_url.lower():
                    ext = '.jpg'
                elif '.png' in img_url.lower():
                    ext = '.png'
                elif '.gif' in img_url.lower():
                    ext = '.gif'
                elif '.webp' in img_url.lower():
                    ext = '.webp'
                else:
                    ext = '.jpg'  # Default

            # Tạo tên file cho ảnh bìa
            cover_filename = f"cover{ext}"
            cover_path = os.path.join(story_dir, cover_filename)

            # Save ảnh
            with open(cover_path, 'wb') as f:
                shutil.copyfileobj(img_response.raw, f)

            file_size = os.path.getsize(cover_path)
            print(f"     ✅ Ảnh bìa saved: {cover_filename} ({file_size} bytes)")

            return {
                'filename': cover_filename,
                'path': cover_path,
                'url': img_url,
                'size': file_size
            }
        else:
            print(f"     ❌ Download failed: Status {img_response.status_code}")
            return None

    except Exception as e:
        print(f"     ❌ Error downloading cover: {e}")
        return None

def get_story_url_from_user():
    """Interface để user nhập URL truyện"""

    print("\n" + "="*60)
    print("🏆 TRUYENFULL FINAL PERFECT CRAWLER")
    print("CHẤT LƯỢNG HOÀN HẢO 100% + ẢNH BÌA")
    print("="*60)

    # Một số URL mẫu
    sample_urls = [
        "https://truyenfull.vision/tam-sinh-tam-the-thap-ly-dao-hoa/",
        "https://truyenfull.vision/co-vo-ngot-ngao-khong-the-chay-thoat/",
        "https://truyenfull.vision/tieu-nong-dan-cua-hoang-gia/",
        "https://truyenfull.vision/phi-cung-kieu-nu/",
        "https://truyenfull.vision/nhan-gian-vo-dao/"
    ]

    print("\n📋 Một số URL mẫu:")
    for i, url in enumerate(sample_urls, 1):
        print(f"   {i}. {url}")

    print("\n" + "-"*60)

    while True:
        choice = input("\n🔗 Nhập URL truyện (hoặc số 1-5 để chọn mẫu, 'exit' để thoát): ").strip()

        if choice.lower() in ['exit', 'quit', 'thoát', 'q']:
            print("👋 Tạm biệt!")
            return None

        # Kiểm tra nếu user chọn số
        if choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(sample_urls):
                selected_url = sample_urls[idx]
                print(f"✅ Đã chọn: {selected_url}")
                return selected_url
            else:
                print(f"❌ Vui lòng chọn từ 1 đến {len(sample_urls)}")
                continue

        # Kiểm tra URL
        if choice.startswith('http'):
            if 'truyenfull.vision' in choice:
                print(f"✅ URL hợp lệ: {choice}")
                return choice
            else:
                print("❌ Tool này chỉ hỗ trợ truyenfull.vision")
                continue
        else:
            print("❌ Vui lòng nhập URL đầy đủ (bắt đầu bằng http)")
            continue

if __name__ == "__main__":
    main()
