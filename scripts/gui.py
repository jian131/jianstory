#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JianStory GUI Crawler Tool
Crawl truyện từ TruyenFull và upload lên database
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import threading
import json
import os
import sys
import subprocess
from datetime import datetime
import webbrowser
from truyenfull_final_perfect import crawl_truyenfull_final_perfect

class JianStoryGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("🏆 JianStory - Crawler & Upload Tool")
        self.root.geometry("800x600")
        self.root.configure(bg='#1a1a1a')

        # Variables
        self.crawl_thread = None
        self.upload_thread = None
        self.is_crawling = False
        self.is_uploading = False

        self.setup_styles()
        self.create_widgets()

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
        # Main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill='both', expand=True, padx=20, pady=20)

        # Title
        title_label = ttk.Label(main_frame, text="🏆 JianStory Crawler & Upload Tool",
                               style='Title.TLabel')
        title_label.pack(pady=(0, 20))

        # URL Input Section
        self.create_url_section(main_frame)

        # Progress Section
        self.create_progress_section(main_frame)

        # Log Section
        self.create_log_section(main_frame)

        # Control Buttons
        self.create_control_section(main_frame)

        # Status Bar
        self.create_status_bar(main_frame)

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
            "https://truyenfull.vision/nhan-gian-vo-dao/"
        ]

        self.sample_var = tk.StringVar()
        sample_combo = ttk.Combobox(url_input_frame, textvariable=self.sample_var,
                                   values=sample_urls, width=40, state='readonly')
        sample_combo.pack(side='right', padx=(10, 0))
        sample_combo.bind('<<ComboboxSelected>>', self.on_sample_selected)

        # Chapter limit
        chapter_frame = ttk.Frame(url_frame)
        chapter_frame.pack(fill='x', pady=(0, 10))

        ttk.Label(chapter_frame, text="📖 Chapters to crawl:",
                 style='Info.TLabel').pack(side='left')

        self.chapter_var = tk.StringVar(value="5")
        chapter_entry = ttk.Entry(chapter_frame, textvariable=self.chapter_var, width=10)
        chapter_entry.pack(side='left', padx=(10, 0))

        ttk.Label(chapter_frame, text="(0 = all chapters)",
                 style='Info.TLabel').pack(side='left', padx=(5, 0))

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

    def create_log_section(self, parent):
        """Create log output section"""
        log_frame = ttk.LabelFrame(parent, text="📝 Log Output", padding=15)
        log_frame.pack(fill='both', expand=True, pady=(0, 15))

        self.log_text = scrolledtext.ScrolledText(log_frame, height=12,
                                                 bg='#2d2d2d', fg='#ffffff',
                                                 font=('Consolas', 9))
        self.log_text.pack(fill='both', expand=True)

    def create_control_section(self, parent):
        """Create control buttons section"""
        control_frame = ttk.Frame(parent)
        control_frame.pack(fill='x', pady=(0, 10))

        # Crawl button
        self.crawl_btn = ttk.Button(control_frame, text="🚀 Crawl Story",
                                   command=self.start_crawl)
        self.crawl_btn.pack(side='left', padx=(0, 10))

        # Upload button
        self.upload_btn = ttk.Button(control_frame, text="📤 Upload to Database",
                                    command=self.start_upload)
        self.upload_btn.pack(side='left', padx=(0, 10))

        # Crawl & Upload button
        self.auto_btn = ttk.Button(control_frame, text="⚡ Crawl & Upload",
                                  command=self.start_auto_process)
        self.auto_btn.pack(side='left', padx=(0, 10))

        # Clear log button
        clear_btn = ttk.Button(control_frame, text="🗑️ Clear Log",
                              command=self.clear_log)
        clear_btn.pack(side='right')

        # Open stories folder
        folder_btn = ttk.Button(control_frame, text="📁 Open Stories Folder",
                               command=self.open_stories_folder)
        folder_btn.pack(side='right', padx=(0, 10))

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
            self.log_message(f"Starting crawl: {url}")

            # Import and use the crawl function
            from truyenfull_final_perfect import crawl_truyenfull_final_perfect

            # Override chapter limit if specified
            chapter_limit = self.chapter_var.get().strip()
            if chapter_limit and chapter_limit.isdigit():
                limit = int(chapter_limit)
                if limit > 0:
                    self.log_message(f"Limiting to {limit} chapters")

            success = crawl_truyenfull_final_perfect(url)

            if success:
                self.log_message("Crawl completed successfully!", 'success')
                self.root.after(0, self._crawl_success)
            else:
                self.log_message("Crawl failed!", 'error')
                self.root.after(0, self._crawl_error)

        except Exception as e:
            self.log_message(f"Crawl error: {str(e)}", 'error')
            self.root.after(0, self._crawl_error)

    def _crawl_success(self):
        """Handle successful crawl"""
        self.is_crawling = False
        self.crawl_btn.config(state='normal')
        self.auto_btn.config(state='normal')
        self.crawl_progress.stop()
        self.status_var.set("Crawl completed successfully")

        # Ask if user wants to upload
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
        self.upload_btn.config(state='disabled')
        self.auto_btn.config(state='disabled')
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

            # Run the import script
            result = subprocess.run(['node', import_script],
                                  capture_output=True, text=True, cwd=os.getcwd())

            if result.returncode == 0:
                self.log_message("Upload completed successfully!", 'success')
                self.log_message(result.stdout)
                self.root.after(0, self._upload_success)
            else:
                self.log_message("Upload failed!", 'error')
                self.log_message(result.stderr, 'error')
                self.root.after(0, self._upload_error)

        except Exception as e:
            self.log_message(f"Upload error: {str(e)}", 'error')
            self.root.after(0, self._upload_error)

    def _upload_success(self):
        """Handle successful upload"""
        self.is_uploading = False
        self.upload_btn.config(state='normal')
        self.auto_btn.config(state='normal')
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
        self.upload_btn.config(state='normal')
        self.auto_btn.config(state='normal')
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
