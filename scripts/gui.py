#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JianStory GUI Crawler Tool - Enhanced Version with Slug Support
Crawl truyện từ TruyenFull và upload lên database và Cloudinary

New Features:
- Slug generation for story names (e.g., "Tru Tiên" → "tru-tien")
- Vietnamese diacritics removal for URL-friendly names
- Display format shows both original and slug in GUI
- Based on W3Schools Django slug field approach
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import threading
import json
import os
import sys
import subprocess
import time
import requests
from bs4 import BeautifulSoup
import urllib.parse as urlparse
import re
from datetime import datetime
import webbrowser
import shutil
import unicodedata

def slugify(text):
    """
    Convert text to URL-friendly slug
    Based on the W3Schools Django slug field approach
    Enhanced for Vietnamese diacritics
    """
    if not text or not isinstance(text, str):
        return 'unknown'

    # Convert to lowercase and strip whitespace
    text = text.lower().strip()

    # Vietnamese character replacements
    vietnamese_map = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd', 'ă': 'a', 'â': 'a', 'ê': 'e', 'ô': 'o', 'ơ': 'o', 'ư': 'u'
    }

    # Replace Vietnamese characters
    for vn_char, latin_char in vietnamese_map.items():
        text = text.replace(vn_char, latin_char)

    # Remove remaining diacritics using Unicode normalization (fallback)
    text = unicodedata.normalize('NFD', text)
    text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')

    # Replace special characters and spaces with hyphens
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)

    # Remove leading/trailing hyphens and limit length
    text = text.strip('-')[:50]

    return text if text else 'unknown'

def create_story_slug(title, author=None):
    """Create a unique story slug from title and optionally author"""
    base_slug = slugify(title)

    if not base_slug or base_slug == 'unknown':
        if author:
            base_slug = f"story-by-{slugify(author)}"
        else:
            base_slug = f"story-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    return base_slug

class JianStoryGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🏆 JianStory - Enhanced Crawler & Upload Tool")
        self.root.geometry("1000x800")
        self.root.configure(bg='#1a1a1a')

        # Variables
        self.crawl_thread = None
        self.upload_thread = None
        self.is_crawling = False
        self.is_uploading = False
        self.crawled_stories = []
        self.selected_stories = []
        self.log_text = None  # Initialize log_text

        self.setup_styles()
        self.create_widgets()
        self.refresh_stories_list()

    def setup_styles(self):
        """Setup custom styles"""
        style = ttk.Style()
        style.theme_use('clam')

        # Configure colors
        style.configure('Title.TLabel', font=('Segoe UI', 16, 'bold'),
                       foreground='#ffffff', background='#1a1a1a')
        style.configure('Header.TLabel', font=('Segoe UI', 12, 'bold'),
                       foreground='#4fc3f7', background='#1a1a1a')
        style.configure('Info.TLabel', font=('Segoe UI', 10),
                       foreground='#b0b0b0', background='#1a1a1a')
        style.configure('Success.TLabel', font=('Segoe UI', 10),
                       foreground='#4caf50', background='#1a1a1a')
        style.configure('Error.TLabel', font=('Segoe UI', 10),
                       foreground='#f44336', background='#1a1a1a')

    def create_widgets(self):
        """Create all GUI widgets"""
        # Create notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill='both', expand=True, padx=10, pady=10)

        # Tab 1: Crawl new story
        self.crawl_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.crawl_frame, text="🚀 Crawl New Story")
        self.create_crawl_tab()

        # Tab 2: Manage existing stories
        self.manage_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.manage_frame, text="📚 Manage Stories")
        self.create_manage_tab()

        # Tab 3: Logs
        self.log_frame = ttk.Frame(self.notebook)
        self.notebook.add(self.log_frame, text="📝 Logs")
        self.create_log_tab()

    def create_crawl_tab(self):
        """Create crawl new story tab"""
        # Title
        title_label = ttk.Label(self.crawl_frame, text="🚀 Crawl New Story",
                               style='Title.TLabel')
        title_label.pack(pady=(20, 20))

        # URL Input Section
        self.create_url_section(self.crawl_frame)

        # Progress Section
        self.create_progress_section(self.crawl_frame)

        # Control Buttons for crawling
        self.create_crawl_control_section(self.crawl_frame)

        # Status Bar
        self.create_status_bar(self.crawl_frame)

    def create_manage_tab(self):
        """Create manage existing stories tab"""
        # Title
        title_label = ttk.Label(self.manage_frame, text="📚 Manage Crawled Stories",
                               style='Title.TLabel')
        title_label.pack(pady=(20, 20))

        # Stories list section
        self.create_stories_list_section(self.manage_frame)

        # Control buttons for managing
        self.create_manage_control_section(self.manage_frame)

    def create_log_tab(self):
        """Create log tab"""
        # Log Section
        log_container = ttk.Frame(self.log_frame)
        log_container.pack(fill='both', expand=True, padx=20, pady=20)

        ttk.Label(log_container, text="📝 System Logs", style='Title.TLabel').pack(pady=(0, 20))

        self.log_text = scrolledtext.ScrolledText(log_container, height=25,
                                                 bg='#2d2d2d', fg='#ffffff',
                                                 font=('Consolas', 9))
        self.log_text.pack(fill='both', expand=True)

        # Clear log button
        clear_btn = ttk.Button(log_container, text="🗑️ Clear Log",
                              command=self.clear_log)
        clear_btn.pack(pady=(10, 0))

    def create_stories_list_section(self, parent):
        """Create stories list section with checkboxes"""
        list_frame = ttk.LabelFrame(parent, text="📖 Crawled Stories", padding=15)
        list_frame.pack(fill='both', expand=True, padx=20, pady=(0, 15))

        # Toolbar
        toolbar_frame = ttk.Frame(list_frame)
        toolbar_frame.pack(fill='x', pady=(0, 10))

        # Refresh button
        refresh_btn = ttk.Button(toolbar_frame, text="🔄 Refresh",
                                command=self.refresh_stories_list)
        refresh_btn.pack(side='left', padx=(0, 10))

        # Select all / none buttons
        select_all_btn = ttk.Button(toolbar_frame, text="✅ Select All",
                                   command=self.select_all_stories)
        select_all_btn.pack(side='left', padx=(0, 10))

        select_none_btn = ttk.Button(toolbar_frame, text="❌ Select None",
                                    command=self.select_none_stories)
        select_none_btn.pack(side='left', padx=(0, 10))

        # Stories count label
        self.stories_count_var = tk.StringVar(value="0 stories found")
        count_label = ttk.Label(toolbar_frame, textvariable=self.stories_count_var,
                               style='Info.TLabel')
        count_label.pack(side='right')

        # Create treeview for stories list
        columns = ('Select', 'Title', 'Author', 'Chapters', 'Status', 'Date')
        self.stories_tree = ttk.Treeview(list_frame, columns=columns, show='headings', height=15)

        # Configure columns
        self.stories_tree.heading('Select', text='Select')
        self.stories_tree.heading('Title', text='Story Title')
        self.stories_tree.heading('Author', text='Author')
        self.stories_tree.heading('Chapters', text='Chapters')
        self.stories_tree.heading('Status', text='Status')
        self.stories_tree.heading('Date', text='Crawl Date')

        self.stories_tree.column('Select', width=60, anchor='center')
        self.stories_tree.column('Title', width=300)
        self.stories_tree.column('Author', width=150)
        self.stories_tree.column('Chapters', width=80, anchor='center')
        self.stories_tree.column('Status', width=100, anchor='center')
        self.stories_tree.column('Date', width=120, anchor='center')

        # Scrollbar for treeview
        tree_scroll = ttk.Scrollbar(list_frame, orient='vertical', command=self.stories_tree.yview)
        self.stories_tree.configure(yscrollcommand=tree_scroll.set)

        # Pack treeview and scrollbar
        self.stories_tree.pack(side='left', fill='both', expand=True)
        tree_scroll.pack(side='right', fill='y')

        # Bind double-click event
        self.stories_tree.bind('<Double-1>', self.on_story_double_click)
        self.stories_tree.bind('<Button-1>', self.on_story_click)

    def create_manage_control_section(self, parent):
        """Create control buttons for managing stories"""
        control_frame = ttk.Frame(parent)
        control_frame.pack(fill='x', padx=20, pady=(0, 20))

        # Upload selected button
        self.upload_selected_btn = ttk.Button(control_frame, text="📤 Upload Selected to Database",
                                             command=self.upload_selected_stories)
        self.upload_selected_btn.pack(side='left', padx=(0, 10))

        # Delete selected button
        delete_btn = ttk.Button(control_frame, text="🗑️ Delete Selected",
                               command=self.delete_selected_stories)
        delete_btn.pack(side='left', padx=(0, 10))

        # View story details button
        view_btn = ttk.Button(control_frame, text="👁️ View Details",
                             command=self.view_story_details)
        view_btn.pack(side='left', padx=(0, 10))

        # Open stories folder
        folder_btn = ttk.Button(control_frame, text="📁 Open Stories Folder",
                               command=self.open_stories_folder)
        folder_btn.pack(side='right')

        # Selected count label
        self.selected_count_var = tk.StringVar(value="0 selected")
        selected_label = ttk.Label(control_frame, textvariable=self.selected_count_var,
                                  style='Info.TLabel')
        selected_label.pack(side='right', padx=(0, 20))

    def create_url_section(self, parent):
        """Create URL input section"""
        url_frame = ttk.LabelFrame(parent, text="📝 Crawl Configuration", padding=15)
        url_frame.pack(fill='x', pady=(0, 15))

        # URL input
        ttk.Label(url_frame, text="🔗 Story URL:", style='Header.TLabel').pack(anchor='w')

        url_input_frame = ttk.Frame(url_frame)
        url_input_frame.pack(fill='x', pady=(5, 10))

        self.url_var = tk.StringVar()
        self.url_entry = ttk.Entry(url_input_frame, textvariable=self.url_var,
                                  font=('Segoe UI', 10))
        self.url_entry.pack(side='left', fill='x', expand=True)

        # Sample URLs dropdown
        sample_urls = [
            "https://truyenfull.vision/tam-sinh-tam-the-thap-ly-dao-hoa/",
            "https://truyenfull.vision/co-vo-ngot-ngao-khong-the-chay-thoat/",
            "https://truyenfull.vision/tieu-nong-dan-cua-hoang-gia/",
            "https://truyenfull.vision/phi-cung-kieu-nu/",
            "https://truyenfull.vision/nhan-gian-vo-dao/",
            "https://truyenfull.vision/tru-tien/"
        ]

        self.sample_var = tk.StringVar()
        sample_combo = ttk.Combobox(url_input_frame, textvariable=self.sample_var,
                                   values=sample_urls, width=40, state='readonly')
        sample_combo.pack(side='right', padx=(10, 0))
        sample_combo.bind('<<ComboboxSelected>>', self.on_sample_selected)

        # Crawl mode selection
        mode_frame = ttk.Frame(url_frame)
        mode_frame.pack(fill='x', pady=(10, 0))

        ttk.Label(mode_frame, text="🎯 Crawl Mode:", style='Header.TLabel').pack(anchor='w')

        # Radio buttons for crawl mode
        self.crawl_mode_var = tk.StringVar(value="normal")

        normal_radio = ttk.Radiobutton(mode_frame, text="🔗 Normal (crawl từ links có sẵn)",
                                     variable=self.crawl_mode_var, value="normal",
                                     command=self.on_crawl_mode_change)
        normal_radio.pack(anchor='w', pady=(5, 0))

        sequential_radio = ttk.Radiobutton(mode_frame, text="📈 Sequential (crawl theo pattern URL tuần tự)",
                                         variable=self.crawl_mode_var, value="sequential",
                                         command=self.on_crawl_mode_change)
        sequential_radio.pack(anchor='w', pady=(2, 0))

        # Sequential options frame
        self.sequential_frame = ttk.Frame(url_frame)

        seq_info_label = ttk.Label(self.sequential_frame,
                                  text="ℹ️ Mode này sẽ crawl theo pattern: /chuong-1/, /chuong-2/, etc.",
                                  style='Info.TLabel')
        seq_info_label.pack(anchor='w', pady=(5, 10))

        # Max chapters input for sequential mode
        seq_chapters_frame = ttk.Frame(self.sequential_frame)
        seq_chapters_frame.pack(fill='x', pady=(0, 5))

        ttk.Label(seq_chapters_frame, text="📖 Max chapters:", style='Info.TLabel').pack(side='left')

        self.seq_chapters_var = tk.StringVar(value="0")
        seq_chapters_entry = ttk.Entry(seq_chapters_frame, textvariable=self.seq_chapters_var, width=10)
        seq_chapters_entry.pack(side='left', padx=(10, 0))

        ttk.Label(seq_chapters_frame, text="(0 = auto-detect khi hết)",
                 style='Info.TLabel').pack(side='left', padx=(5, 0))

        # Resume option
        self.resume_var = tk.BooleanVar(value=True)
        resume_check = ttk.Checkbutton(self.sequential_frame,
                                     text="🔄 Resume từ chapter cuối cùng đã crawl",
                                     variable=self.resume_var)
        resume_check.pack(anchor='w', pady=(5, 0))

        # Chapter limit for normal mode
        normal_chapter_frame = ttk.Frame(url_frame)
        normal_chapter_frame.pack(fill='x', pady=(10, 0))

        ttk.Label(normal_chapter_frame, text="📖 Chapters to crawl:",
                 style='Info.TLabel').pack(side='left')

        self.chapter_var = tk.StringVar(value="5")
        chapter_entry = ttk.Entry(normal_chapter_frame, textvariable=self.chapter_var, width=10)
        chapter_entry.pack(side='left', padx=(10, 0))

        ttk.Label(normal_chapter_frame, text="(0 = all chapters)",
                 style='Info.TLabel').pack(side='left', padx=(5, 0))

        # Initially hide sequential options
        self.on_crawl_mode_change()

    def create_progress_section(self, parent):
        """Create progress tracking section"""
        progress_frame = ttk.LabelFrame(parent, text="📊 Progress", padding=15)
        progress_frame.pack(fill='x', pady=(0, 15))

        # Crawl progress
        ttk.Label(progress_frame, text="Crawl Progress:",
                 style='Info.TLabel').pack(anchor='w')
        self.crawl_progress = ttk.Progressbar(progress_frame, mode='indeterminate')
        self.crawl_progress.pack(fill='x', pady=(5, 10))

        # Upload progress
        ttk.Label(progress_frame, text="Upload Progress:",
                 style='Info.TLabel').pack(anchor='w')
        self.upload_progress = ttk.Progressbar(progress_frame, mode='indeterminate')
        self.upload_progress.pack(fill='x', pady=5)

    def create_crawl_control_section(self, parent):
        """Create control buttons for crawling"""
        control_frame = ttk.Frame(parent)
        control_frame.pack(fill='x', pady=(0, 10))

        # Crawl button
        self.crawl_btn = ttk.Button(control_frame, text="🚀 Crawl Story",
                                   command=self.start_crawl)
        self.crawl_btn.pack(side='left', padx=(0, 10))

        # Crawl & Upload button
        self.auto_btn = ttk.Button(control_frame, text="⚡ Crawl & Upload",
                                  command=self.start_auto_process)
        self.auto_btn.pack(side='left', padx=(0, 10))

    def create_status_bar(self, parent):
        """Create status bar"""
        self.status_var = tk.StringVar(value="Ready")
        status_bar = ttk.Label(parent, textvariable=self.status_var,
                              style='Info.TLabel', relief='sunken')
        status_bar.pack(fill='x', side='bottom')

    def on_sample_selected(self, event):
        """Handle sample URL selection"""
        self.url_var.set(self.sample_var.get())

    def log_message(self, message, level='info'):
        """Add message to log"""
        timestamp = datetime.now().strftime("%H:%M:%S")

        if level == 'success':
            prefix = "✅"
        elif level == 'error':
            prefix = "❌"
        elif level == 'warning':
            prefix = "⚠️"
        else:
            prefix = "ℹ️"

        log_line = f"[{timestamp}] {prefix} {message}\n"

        self.log_text.insert(tk.END, log_line)
        self.log_text.see(tk.END)
        self.root.update_idletasks()

    def clear_log(self):
        """Clear log text"""
        self.log_text.delete(1.0, tk.END)

    def open_stories_folder(self):
        """Open stories folder in file explorer"""
        stories_path = os.path.join(os.getcwd(), '..', 'stories')
        if os.path.exists(stories_path):
            if sys.platform == 'win32':
                os.startfile(stories_path)
            elif sys.platform == 'darwin':
                subprocess.call(['open', stories_path])
            else:
                subprocess.call(['xdg-open', stories_path])
        else:
            messagebox.showinfo("Info", "Stories folder doesn't exist yet.")

    def validate_url(self, url):
        """Validate TruyenFull URL"""
        if not url:
            return False, "Please enter a story URL"

        if not url.startswith('http'):
            return False, "URL must start with http:// or https://"

        if 'truyenfull.vision' not in url:
            return False, "Only TruyenFull.vision URLs are supported"

        return True, "URL is valid"

    def start_crawl(self):
        """Start crawling process"""
        if self.is_crawling:
            messagebox.showwarning("Warning", "Crawling is already in progress")
            return

        url = self.url_var.get().strip()
        is_valid, message = self.validate_url(url)

        if not is_valid:
            messagebox.showerror("Invalid URL", message)
            return

        self.is_crawling = True
        self.crawl_btn.config(state='disabled')
        self.auto_btn.config(state='disabled')
        self.crawl_progress.start()
        self.status_var.set("Crawling story...")

        self.crawl_thread = threading.Thread(target=self._crawl_worker, args=(url,))
        self.crawl_thread.daemon = True
        self.crawl_thread.start()

    def _crawl_worker(self, url):
        """Worker thread for crawling"""
        try:
            crawl_mode = self.crawl_mode_var.get()

            if crawl_mode == "sequential":
                self.log_message(f"🚀 Starting sequential crawl: {url}")

                # Get sequential crawl parameters
                max_chapters = self.seq_chapters_var.get().strip()
                max_chapters_int = None
                if max_chapters and max_chapters.isdigit():
                    limit = int(max_chapters)
                    if limit > 0:
                        max_chapters_int = limit
                        self.log_message(f"📖 Max chapters limit: {max_chapters_int}")

                resume_crawl = self.resume_var.get()
                self.log_message(f"🔄 Resume mode: {'enabled' if resume_crawl else 'disabled'}")

                # Call sequential crawler
                success = self._sequential_crawl_with_gui_params(url, max_chapters_int, resume_crawl)

            else:
                self.log_message(f"🔗 Starting normal crawl: {url}")

                # Get normal crawl parameters
                chapter_limit = self.chapter_var.get().strip()
                max_chapters = None
                if chapter_limit and chapter_limit.isdigit():
                    limit = int(chapter_limit)
                    if limit > 0:
                        max_chapters = limit
                        self.log_message(f"📖 Limiting to {max_chapters} chapters")

                # Call normal crawler
                success = self._crawl_with_gui_params(url, max_chapters)

            if success:
                self.log_message("✅ Crawl completed successfully!", 'success')
                self.root.after(0, self._crawl_success)
            else:
                self.log_message("❌ Crawl failed!", 'error')
                self.root.after(0, self._crawl_error)

        except Exception as e:
            self.log_message(f"❌ Crawl error: {str(e)}", 'error')
            self.root.after(0, self._crawl_error)

    def _sequential_crawl_with_gui_params(self, url, max_chapters=None, resume_crawl=True):
        """Sequential crawl function integrated with GUI"""
        try:
            # Import sequential crawler functions
            from crawl_sequential_chapters import (
                get_base_story_info,
                detect_chapter_pattern,
                crawl_sequential_chapters
            )

            self.log_message("📊 Getting story info...")

            # Get story info
            story_info = get_base_story_info(url)
            if not story_info:
                self.log_message("❌ Failed to get story info", 'error')
                return False

            self.log_message(f"📚 Title: {story_info['title']}")
            self.log_message(f"✍️ Author: {story_info['author']}")
            self.log_message(f"🔗 Slug: {story_info['story_slug']}")

            # Detect chapter pattern
            self.log_message("🔍 Detecting chapter pattern...")
            pattern = detect_chapter_pattern(story_info['story_slug'])
            if not pattern:
                self.log_message("❌ Failed to detect chapter pattern", 'error')
                return False

            self.log_message(f"✅ Pattern detected: {pattern}")

            # Start sequential crawling
            chapters = crawl_sequential_chapters(
                story_info,
                pattern,
                start_chapter=1,
                max_chapters=max_chapters,
                batch_size=50
            )

            self.log_message(f"🎉 Sequential crawl completed! {len(chapters)} chapters", 'success')
            return True

        except ImportError:
            self.log_message("❌ Sequential crawler module not found", 'error')
            return False
        except Exception as e:
            self.log_message(f"❌ Sequential crawl error: {e}", 'error')
            return False

    def _crawl_with_gui_params(self, url, max_chapters=None):
        """Modified crawl function that doesn't require user input"""
        from truyenfull_final_perfect import (
            extract_content_preserve_exact_formatting,
            smart_fix_vietnamese_broken_words,
            download_cover_image
        )

        self.log_message(f"🎯 Starting crawl: {url}")

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        try:
            # 1. Fetch story page
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code != 200:
                self.log_message(f"❌ Status code: {response.status_code}")
                return False

            soup = BeautifulSoup(response.content, 'html.parser')
            self.log_message("✅ Story page loaded")

            # 2. Extract metadata
            title = ""
            author = ""

            h1_title = soup.select_one('h1')
            if h1_title:
                title = h1_title.get_text().strip()
                story_slug = slugify(title)
                self.log_message(f"📚 Title: {title} → {story_slug}")

            author_link = soup.select_one("a[href*='tac-gia']")
            if author_link:
                author = author_link.get_text().strip()
                self.log_message(f"✍️  Author: {author}")

            # 3. Create story directory
            story_name = create_story_slug(title, author) if title else 'unknown-story'
            story_dir = f"../stories/{story_name}"
            os.makedirs(story_dir, exist_ok=True)

            # 4. Download cover image
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

            self.log_message(f"📖 Found {len(filtered_chapters)} chapters")

            if not filtered_chapters:
                self.log_message("❌ No chapters found!")
                return False

            # 6. Determine how many chapters to crawl
            if max_chapters is None:
                max_chapters = len(filtered_chapters)
            else:
                max_chapters = min(max_chapters, len(filtered_chapters))

            self.log_message(f"🚀 Will crawl {max_chapters}/{len(filtered_chapters)} chapters...")

            # 7. Crawl chapters
            chapters_data = []
            success_count = 0

            for i, chapter_link in enumerate(filtered_chapters[:max_chapters], 1):
                chapter_href = chapter_link.get('href', '')
                chapter_title = chapter_link.get_text().strip()

                if chapter_href.startswith('/'):
                    chapter_url = 'https://truyenfull.vision' + chapter_href
                elif not chapter_href.startswith('http'):
                    chapter_url = urlparse.urljoin(url, chapter_href)
                else:
                    chapter_url = chapter_href

                self.log_message(f"📄 [{i}/{max_chapters}] {chapter_title}")

                try:
                    chapter_response = requests.get(chapter_url, headers=headers, timeout=15)
                    if chapter_response.status_code != 200:
                        self.log_message(f"❌ Status: {chapter_response.status_code}")
                        continue

                    chapter_soup = BeautifulSoup(chapter_response.content, 'html.parser')

                    # Extract content
                    content_elem = chapter_soup.select_one('#chapter-c')
                    if not content_elem:
                        content_elem = chapter_soup.select_one('.chapter-c')

                    if content_elem:
                        # Extract and fix content
                        raw_content = extract_content_preserve_exact_formatting(content_elem)
                        final_content = smart_fix_vietnamese_broken_words(raw_content)

                        # Analysis
                        total_lines = len(final_content.split('\n'))
                        non_empty_lines = len([line for line in final_content.split('\n') if line.strip()])

                        self.log_message(f"✅ Content: {len(final_content)} chars, {non_empty_lines} lines")

                        # Save chapter
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
                        self.log_message(f"❌ No content found!")

                    time.sleep(1)

                except Exception as e:
                    self.log_message(f"❌ Error: {e}")

            # 8. Save story info
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

            self.log_message(f"🎉 Crawl completed! {success_count}/{max_chapters} chapters")
            if cover_info:
                self.log_message(f"🖼️  Cover: {cover_info['filename']}")

            return True

        except Exception as e:
            self.log_message(f"❌ Error: {e}")
            return False

    def _crawl_success(self):
        """Handle successful crawl"""
        self.is_crawling = False
        self.crawl_btn.config(state='normal')
        self.crawl_progress.stop()
        self.status_var.set("Crawl completed successfully")

        # Check if this was part of auto process
        if hasattr(self, 'auto_crawl_url'):
            # Auto upload after crawl
            delattr(self, 'auto_crawl_url')
            self.start_upload()
        else:
            # Ask if user wants to upload
            self.auto_btn.config(state='normal')
            result = messagebox.askyesno("Crawl Complete",
                                       "Story crawled successfully!\n\n"
                                       "Do you want to upload it to the database now?")
            if result:
                self.start_upload()

    def _crawl_error(self):
        """Handle crawl error"""
        self.is_crawling = False
        self.crawl_btn.config(state='normal')
        self.auto_btn.config(state='normal')
        self.crawl_progress.stop()
        self.status_var.set("Crawl failed")

    def start_upload(self):
        """Start upload process"""
        if self.is_uploading:
            messagebox.showwarning("Warning", "Upload is already in progress")
            return

        # Check if stories directory exists
        stories_path = os.path.join(os.getcwd(), '..', 'stories')
        if not os.path.exists(stories_path):
            messagebox.showerror("Error", "No stories found to upload. Please crawl a story first.")
            return

        self.is_uploading = True
        self.upload_progress.start()
        self.status_var.set("Uploading to database...")

        self.upload_thread = threading.Thread(target=self._upload_worker)
        self.upload_thread.daemon = True
        self.upload_thread.start()

    def _upload_worker(self):
        """Worker thread for uploading"""
        try:
            self.log_message("Starting upload to database...")

            # Check if import script exists
            import_script = os.path.join(os.getcwd(), 'import-stories.js')
            if not os.path.exists(import_script):
                self.log_message("import-stories.js not found!", 'error')
                self.root.after(0, self._upload_error)
                return

            # Set environment for Windows encoding
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'

            # Run the import script
            result = subprocess.run(['node', import_script],
                                  capture_output=True, text=True, encoding='utf-8',
                                  errors='replace', cwd=os.getcwd(), env=env)

            if result.returncode == 0:
                self.log_message("Upload completed successfully!", 'success')
                if result.stdout:
                    # Process stdout line by line for better logging
                    for line in result.stdout.strip().split('\n'):
                        if line.strip():
                            self.log_message(line.strip())
                self.root.after(0, self._upload_success)
            else:
                self.log_message("Upload failed!", 'error')
                if result.stderr:
                    # Process stderr line by line
                    for line in result.stderr.strip().split('\n'):
                        if line.strip():
                            self.log_message(line.strip(), 'error')
                self.root.after(0, self._upload_error)

        except UnicodeDecodeError as e:
            self.log_message(f"Encoding error: {str(e)}", 'error')
            self.log_message("Try setting PYTHONIOENCODING=utf-8", 'warning')
            self.root.after(0, self._upload_error)
        except Exception as e:
            self.log_message(f"Upload error: {str(e)}", 'error')
            self.root.after(0, self._upload_error)

    def _upload_success(self):
        """Handle successful upload"""
        self.is_uploading = False
        self.upload_progress.stop()
        self.status_var.set("Upload completed successfully")

        # Ask if user wants to open the website
        result = messagebox.askyesno("Upload Complete",
                                   "Stories uploaded successfully!\n\n"
                                   "Do you want to open the website to view them?")
        if result:
            webbrowser.open('http://localhost:3000')

    def _upload_error(self):
        """Handle upload error"""
        self.is_uploading = False
        self.upload_progress.stop()
        self.status_var.set("Upload failed")

    def start_auto_process(self):
        """Start automatic crawl + upload process"""
        if self.is_crawling or self.is_uploading:
            messagebox.showwarning("Warning", "Process is already running")
            return

        url = self.url_var.get().strip()
        is_valid, message = self.validate_url(url)

        if not is_valid:
            messagebox.showerror("Invalid URL", message)
            return

        # Mark this as auto process
        self.auto_crawl_url = url
        self.start_crawl()

    def on_closing(self):
        """Handle window closing"""
        if self.is_crawling or self.is_uploading:
            result = messagebox.askyesno("Confirm Exit",
                                       "A process is still running. Are you sure you want to exit?")
            if not result:
                return

        self.root.destroy()

    def refresh_stories_list(self):
        """Refresh stories list from stories directory"""
        self.crawled_stories = []
        self.selected_stories = []

        stories_dir = os.path.join(os.getcwd(), '..', 'stories')

        if not os.path.exists(stories_dir):
            if hasattr(self, 'stories_count_var'):
                self.stories_count_var.set("0 stories found")
            return

        # Clear existing items if tree exists
        if hasattr(self, 'stories_tree'):
            for item in self.stories_tree.get_children():
                self.stories_tree.delete(item)

            # Scan stories directory
            for story_folder in os.listdir(stories_dir):
                story_path = os.path.join(stories_dir, story_folder)

                if os.path.isdir(story_path):
                    # Look for story info file
                    info_file = os.path.join(story_path, 'story_info_FINAL.json')

                    if os.path.exists(info_file):
                        try:
                            with open(info_file, 'r', encoding='utf-8') as f:
                                story_info = json.load(f)

                            # Get story details
                            title = story_info.get('title', 'Unknown Title')
                            author = story_info.get('author', 'Unknown Author')
                            chapters = story_info.get('crawled_chapters', 0)

                            # Get creation date
                            creation_time = os.path.getctime(info_file)
                            date_str = datetime.fromtimestamp(creation_time).strftime('%Y-%m-%d')

                            # Check if already uploaded (you can implement this check)
                            status = "Ready"

                            # Insert into tree
                            item = self.stories_tree.insert('', 'end', values=(
                                "☐",  # Not selected
                                self.format_story_display_name(title),
                                author,
                                chapters,
                                status,
                                date_str
                            ))

                            # Store story info for later use
                            self.crawled_stories.append({
                                'item_id': item,
                                'folder': story_folder,
                                'info': story_info,
                                'selected': False
                            })

                        except Exception as e:
                            if self.log_text:
                                self.log_message(f"Error reading story info: {e}", 'error')

            if hasattr(self, 'stories_count_var'):
                self.stories_count_var.set(f"{len(self.crawled_stories)} stories found")
            if hasattr(self, 'update_selected_count'):
                self.update_selected_count()

    def select_all_stories(self):
        """Select all stories"""
        for item in self.stories_tree.get_children():
            # Update display
            values = list(self.stories_tree.item(item, 'values'))
            values[0] = "☑"
            self.stories_tree.item(item, values=values)

        # Update internal tracking
        for story in self.crawled_stories:
            story['selected'] = True

        self.update_selected_count()

    def select_none_stories(self):
        """Deselect all stories"""
        for item in self.stories_tree.get_children():
            # Update display
            values = list(self.stories_tree.item(item, 'values'))
            values[0] = "☐"
            self.stories_tree.item(item, values=values)

        # Update internal tracking
        for story in self.crawled_stories:
            story['selected'] = False

        self.update_selected_count()

    def on_story_click(self, event):
        """Handle story click to toggle selection"""
        region = self.stories_tree.identify_region(event.x, event.y)
        if region == "cell":
            row_id = self.stories_tree.identify_row(event.y)
            column = self.stories_tree.identify_column(event.x)

            if row_id and column == '#1':  # First column (Select)
                # Toggle selection
                values = list(self.stories_tree.item(row_id, 'values'))

                # Find corresponding story
                for story in self.crawled_stories:
                    if story['item_id'] == row_id:
                        story['selected'] = not story['selected']
                        values[0] = "☑" if story['selected'] else "☐"
                        self.stories_tree.item(row_id, values=values)
                        break

                self.update_selected_count()

    def on_story_double_click(self, event):
        """Handle story double-click to view details"""
        row_id = self.stories_tree.identify_row(event.y)
        if row_id:
            self.view_story_details(row_id)

    def update_selected_count(self):
        """Update selected stories count"""
        selected_count = sum(1 for story in self.crawled_stories if story['selected'])
        self.selected_count_var.set(f"{selected_count} selected")

    def view_story_details(self, row_id=None):
        """View detailed information about selected story"""
        if not row_id:
            selected_items = self.stories_tree.selection()
            if not selected_items:
                messagebox.showwarning("Warning", "Please select a story first")
                return
            row_id = selected_items[0]

        # Find story info
        story_info = None
        for story in self.crawled_stories:
            if story['item_id'] == row_id:
                story_info = story['info']
                break

        if not story_info:
            messagebox.showerror("Error", "Story information not found")
            return

        # Create details window
        details_window = tk.Toplevel(self.root)
        details_window.title("📖 Story Details")
        details_window.geometry("600x500")
        details_window.configure(bg='#1a1a1a')

        # Create scrollable text widget
        text_widget = scrolledtext.ScrolledText(details_window,
                                               bg='#2d2d2d', fg='#ffffff',
                                               font=('Segoe UI', 10),
                                               wrap=tk.WORD)
        text_widget.pack(fill='both', expand=True, padx=20, pady=20)

        # Format story details
        details_text = f"""📚 STORY DETAILS

🏷️  Title: {story_info.get('title', 'N/A')}
✍️  Author: {story_info.get('author', 'N/A')}
🔗 URL: {story_info.get('url', 'N/A')}
📊 Total Chapters: {story_info.get('total_chapters', 'N/A')}
✅ Crawled Chapters: {story_info.get('crawled_chapters', 'N/A')}
🖼️  Cover Image: {story_info.get('cover_image', {}).get('filename', 'N/A')}
📝 Quality Note: {story_info.get('quality_note', 'N/A')}

📖 CHAPTERS:
"""

        for i, chapter in enumerate(story_info.get('chapters', []), 1):
            details_text += f"\n{i}. {chapter.get('title', 'N/A')}"
            details_text += f"\n   📄 Lines: {chapter.get('non_empty_lines', 0)}/{chapter.get('total_lines', 0)}"
            details_text += f"\n   📏 Characters: {len(chapter.get('content', ''))}"

        text_widget.insert(tk.END, details_text)
        text_widget.config(state='disabled')

    def upload_selected_stories(self):
        """Upload selected stories to database and Cloudinary"""
        selected_stories = [story for story in self.crawled_stories if story['selected']]

        if not selected_stories:
            messagebox.showwarning("Warning", "No stories selected for upload")
            return

        if self.is_uploading:
            messagebox.showwarning("Warning", "Upload is already in progress")
            return

        # Confirm upload
        result = messagebox.askyesno("Confirm Upload",
                                   f"Upload {len(selected_stories)} selected stories to database and Cloudinary?")
        if not result:
            return

        self.is_uploading = True
        self.upload_selected_btn.config(state='disabled')
        self.upload_progress.start()
        self.status_var.set("Uploading selected stories...")

        self.upload_thread = threading.Thread(target=self._upload_selected_worker,
                                             args=(selected_stories,))
        self.upload_thread.daemon = True
        self.upload_thread.start()

    def _upload_selected_worker(self, selected_stories):
        """Worker thread for uploading selected stories"""
        try:
            self.log_message(f"Starting upload of {len(selected_stories)} stories...")

            # Set environment for Windows encoding
            env = os.environ.copy()
            env['PYTHONIOENCODING'] = 'utf-8'

            success_count = 0
            for story in selected_stories:
                try:
                    self.log_message(f"Uploading: {story['info']['title']}")

                    # Create temporary JSON file for this story
                    temp_folder = os.path.join(os.getcwd(), '..', 'stories', story['folder'])

                    # Run import script for this specific story
                    result = subprocess.run(['node', 'import-stories.js', temp_folder],
                                          capture_output=True, text=True, encoding='utf-8',
                                          errors='replace', cwd=os.getcwd(), env=env)

                    if result.returncode == 0:
                        self.log_message(f"✅ Uploaded: {story['info']['title']}", 'success')
                        success_count += 1

                        # Update status in tree
                        values = list(self.stories_tree.item(story['item_id'], 'values'))
                        values[4] = "Uploaded"
                        self.stories_tree.item(story['item_id'], values=values)

                        # Log output if available
                        if result.stdout:
                            for line in result.stdout.strip().split('\n'):
                                if line.strip() and 'story import completed' in line.lower():
                                    self.log_message(f"  {line.strip()}")

                    else:
                        self.log_message(f"❌ Failed to upload: {story['info']['title']}", 'error')
                        if result.stderr:
                            for line in result.stderr.strip().split('\n'):
                                if line.strip():
                                    self.log_message(f"  {line.strip()}", 'error')

                except UnicodeDecodeError as e:
                    self.log_message(f"❌ Encoding error uploading {story['info']['title']}: {e}", 'error')
                except Exception as e:
                    self.log_message(f"❌ Error uploading {story['info']['title']}: {e}", 'error')

            self.log_message(f"Upload completed: {success_count}/{len(selected_stories)} stories", 'success')
            self.root.after(0, lambda: self._upload_selected_success(success_count, len(selected_stories)))

        except Exception as e:
            self.log_message(f"Upload error: {str(e)}", 'error')
            self.root.after(0, self._upload_selected_error)

    def _upload_selected_success(self, success_count, total_count):
        """Handle successful upload of selected stories"""
        self.is_uploading = False
        self.upload_selected_btn.config(state='normal')
        self.upload_progress.stop()
        self.status_var.set(f"Upload completed: {success_count}/{total_count} stories")

        # Ask if user wants to open website
        if success_count > 0:
            result = messagebox.askyesno("Upload Complete",
                                       f"Successfully uploaded {success_count} stories!\n\n"
                                       "Do you want to open the website to view them?")
            if result:
                webbrowser.open('http://localhost:3000')

    def _upload_selected_error(self):
        """Handle upload error for selected stories"""
        self.is_uploading = False
        self.upload_selected_btn.config(state='normal')
        self.upload_progress.stop()
        self.status_var.set("Upload failed")

    def delete_selected_stories(self):
        """Delete selected stories from disk"""
        selected_stories = [story for story in self.crawled_stories if story['selected']]

        if not selected_stories:
            messagebox.showwarning("Warning", "No stories selected for deletion")
            return

        # Confirm deletion
        result = messagebox.askyesno("Confirm Deletion",
                                   f"Delete {len(selected_stories)} selected stories from disk?\n\n"
                                   "This action cannot be undone!")
        if not result:
            return

        try:
            deleted_count = 0
            for story in selected_stories:
                story_path = os.path.join(os.getcwd(), '..', 'stories', story['folder'])
                if os.path.exists(story_path):
                    shutil.rmtree(story_path)
                    deleted_count += 1
                    self.log_message(f"Deleted: {story['info']['title']}", 'success')

            self.log_message(f"Deleted {deleted_count} stories", 'success')
            self.refresh_stories_list()
            messagebox.showinfo("Success", f"Deleted {deleted_count} stories")

        except Exception as e:
            self.log_message(f"Error deleting stories: {e}", 'error')
            messagebox.showerror("Error", f"Error deleting stories: {e}")

    def on_crawl_mode_change(self):
        """Handle crawl mode change"""
        if self.crawl_mode_var.get() == "sequential":
            self.sequential_frame.pack(fill='x', pady=(10, 0))
        else:
            self.sequential_frame.pack_forget()

    def format_story_display_name(self, title, show_slug=True):
        """Format story name for display - show both original and slug"""
        if not title:
            return 'Unknown Story'

        if show_slug:
            slug = slugify(title)
            if slug != title.lower():
                return f"{title} ({slug})"

        return title

def main():
    """Main function"""
    # Create the GUI
    root = tk.Tk()
    app = JianStoryGUI(root)

    # Handle window closing
    root.protocol("WM_DELETE_WINDOW", app.on_closing)

    # Center window on screen
    root.update_idletasks()
    width = root.winfo_width()
    height = root.winfo_height()
    x = (root.winfo_screenwidth() // 2) - (width // 2)
    y = (root.winfo_screenheight() // 2) - (height // 2)
    root.geometry(f'{width}x{height}+{x}+{y}')

    # Start the GUI
    root.mainloop()

if __name__ == "__main__":
    main()
