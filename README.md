# 📚 JianStory - Web Đọc Truyện Online

Website đọc truyện online hoàn chỉnh được xây dựng với Next.js 14, Supabase, và Cloudinary.

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: Supabase PostgreSQL
- **Image Storage**: Cloudinary
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Authentication**: Supabase Auth

## 📋 Features

### ✅ Chính

- 🏠 Trang chủ với grid truyện và pagination
- 📖 Trang chi tiết truyện với danh sách chapters
- 📄 Trang đọc chapter với reading controls
- 🔍 Tìm kiếm truyện theo tên, tác giả, thể loại
- 👨‍💼 Admin panel quản lý truyện và chapters
- 📱 Responsive design cho mobile và desktop

### ✅ Phụ

- 🔐 User authentication (login/register)
- 📚 Lịch sử đọc cá nhân
- ⭐ Rating và comment system
- 📊 Reading progress tracking
- 🌙 Dark/light theme toggle
- 📤 Social sharing

## 🛠️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/jian131/jianstory.git
cd jianstory
npm install
```

### 2. Setup Supabase

#### Tạo Project

1. Đi đến [supabase.com](https://supabase.com)
2. Tạo account và new project
3. Chọn region gần nhất (Singapore cho VN)
4. Đợi project được tạo

#### Setup Database

1. Vào **SQL Editor** trong Supabase dashboard
2. Copy nội dung file `database/schema.sql`
3. Paste và chạy để tạo tables và policies

#### Lấy API Keys

1. Vào **Settings** > **API**
2. Copy:
   - `Project URL`
   - `anon public key`
   - `service_role key` (chỉ dùng server-side)

### 3. Setup Cloudinary

#### Tạo Account

1. Đi đến [cloudinary.com](https://cloudinary.com)
2. Đăng ký free account (25GB storage)
3. Vào **Dashboard**

#### Lấy Credentials

1. Copy:
   - `Cloud name`
   - `API Key`
   - `API Secret`

### 4. Environment Variables

Tạo file `.env.local`:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Image Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Next.js
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# Admin
ADMIN_EMAILS=your_admin_email@example.com
```

### 5. Development

```bash
# Chạy development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 6. Deploy to Vercel

#### Setup Vercel

1. Đi đến [vercel.com](https://vercel.com)
2. Connect GitHub account
3. Import repository `jianstory`
4. Thêm environment variables từ `.env.local`
5. Deploy!

#### Custom Domain (.eu.org)

1. Đăng ký domain miễn phí tại [nic.eu.org](https://nic.eu.org)
2. Trong Vercel dashboard > Domains
3. Thêm custom domain
4. Update DNS records theo hướng dẫn Vercel

## 📁 Project Structure

```
jianstory/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Homepage
│   │   ├── stories/         # Story pages
│   │   ├── read/           # Chapter reader
│   │   └── admin/          # Admin panel
│   └── components/         # Reusable components
├── lib/                    # Utilities and configs
│   ├── supabase.ts        # Supabase client setup
│   └── utils.ts           # Helper functions
├── database/              # Database schemas
├── scripts/              # Crawler scripts
└── public/               # Static assets
```

## 🔧 Usage

### Crawl Data từ TruyenFull

```bash
# Chạy crawler script
cd scripts
python truyenfull_final_perfect.py

# Import data vào Supabase (sẽ có script import riêng)
```

### Admin Functions

1. Đăng nhập với email admin
2. Vào `/admin` để quản lý:
   - Upload/edit stories
   - Manage chapters
   - User management
   - View analytics

### User Features

- **Đăng ký/Đăng nhập**: Supabase Auth
- **Đọc truyện**: Reading interface với controls
- **Lịch sử**: Automatic progress tracking
- **Rating/Comment**: Interactive features

## 🔐 Security

- Row Level Security (RLS) enabled
- API keys trong environment variables
- Admin role-based access control
- Input validation và sanitization

## 📊 Performance

- Next.js optimization (SSG, ISR)
- Image optimization với Cloudinary
- Database indexing
- Lazy loading
- Caching strategies

## 🚀 Scaling

### Free Tier Limits

- **Supabase**: 500MB database, 2GB bandwidth/month
- **Cloudinary**: 25GB storage, 25GB bandwidth/month
- **Vercel**: 100GB bandwidth/month

### Optimization Tips

- Optimize images với Cloudinary transformations
- Use Next.js caching
- Implement pagination
- Monitor usage trong dashboards

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Kiểm tra SUPABASE_URL và ANON_KEY
   - Verify RLS policies

2. **Image Upload Failed**

   - Check Cloudinary credentials
   - Verify upload presets

3. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall: `rm -rf node_modules && npm install`

### Support

- GitHub Issues: [Create Issue](https://github.com/jian131/jianstory/issues)
- Email: your_email@example.com

## 📈 Roadmap

- [ ] Mobile app với React Native
- [ ] Advanced search filters
- [ ] Recommendation system
- [ ] Social features (follow authors)
- [ ] Multiple language support
- [ ] Offline reading mode

## 📄 License

MIT License - see LICENSE file for details

---

⭐ **Star this repo if you find it helpful!**
