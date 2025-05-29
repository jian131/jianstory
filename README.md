# 🏆 JianStory - Nền Tảng Đọc Truyện Hoàn Hảo

![JianStory Banner](./public/banner.png)

**JianStory** là một nền tảng đọc truyện hiện đại được xây dựng với **Next.js 15**, **Supabase**, và **Tailwind CSS**. Hệ thống được thiết kế với **authentication**, **comment system**, **rating system**, và **role-based permissions**.

## ✨ Tính Năng Chính

### 🔐 **Authentication System**

- ✅ Đăng ký/Đăng nhập với Supabase Auth
- ✅ Email verification
- ✅ Session management với SSR
- ✅ Role-based permissions (admin, moderator, premium, user)

### 💬 **Comment System**

- ✅ Bình luận theo chapter và story
- ✅ Hệ thống reply (trả lời bình luận)
- ✅ Like/Unlike comments
- ✅ Real-time notifications
- ✅ Moderation tools cho admin/moderator

### ⭐ **Rating System**

- ✅ Đánh giá 5 sao cho stories
- ✅ Viết review chi tiết
- ✅ Tính toán rating trung bình tự động
- ✅ Xem lịch sử đánh giá của user

### 📚 **Story Management**

- ✅ CRUD stories với rich text editor
- ✅ Category system (Tiên Hiệp, Ngôn Tình, Kiếm Hiệp...)
- ✅ Chapter management
- ✅ Reading progress tracking
- ✅ Bookmark system

### 👥 **User Roles & Permissions**

- **Admin**: Toàn quyền quản lý
- **Moderator**: Quản lý content, moderate comments
- **Premium**: Tính năng đặc biệt (đang phát triển)
- **User**: Đọc, comment, rating

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **Auth**: Supabase Auth với SSR
- **Database**: PostgreSQL với Row Level Security

## 🛠️ Setup & Installation

### 1. **Clone Repository**

```bash
git clone https://github.com/yourusername/jianstory.git
cd jianstory
npm install
```

### 2. **Setup Supabase**

#### a) Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com)
2. Tạo project mới: `jianstory-db`
3. Chọn region: `Southeast Asia (Singapore)`

#### b) Lấy Credentials

1. Vào **Settings > API**
2. Copy:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...`

#### c) Setup Database Schema

1. Vào **SQL Editor**
2. Copy nội dung file `database/schema.sql`
3. Paste và **Run** để tạo tables

### 3. **Environment Variables**

Tạo file `.env.local`:

```env
# Supabase - Thay bằng credentials của bạn
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin email - thay bằng email của bạn
ADMIN_EMAILS=your-email@gmail.com

# Next.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. **Seed Sample Data**

```bash
npm run seed
```

### 5. **Run Development Server**

```bash
npm run dev
```

Truy cập: http://localhost:3000

## 📊 Database Schema

### **Core Tables**

- `profiles` - User profiles với roles
- `authors` - Tác giả truyện
- `categories` - Thể loại truyện
- `stories` - Truyện với metadata
- `chapters` - Chương truyện

### **User Interaction**

- `reading_progress` - Tiến độ đọc
- `bookmarks` - Đánh dấu yêu thích
- `story_ratings` - Đánh giá & review
- `story_likes` / `chapter_likes` - Like system

### **Comment System**

- `story_comments` - Bình luận truyện
- `chapter_comments` - Bình luận chương
- `comment_likes` - Like comment

### **Admin System**

- `notifications` - Thông báo
- `moderation_logs` - Log moderation

## 🎯 User Roles

| Role          | Permissions                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------- |
| **Admin**     | • Toàn quyền quản lý<br>• CRUD stories/chapters<br>• User management<br>• Moderate comments |
| **Moderator** | • Moderate comments<br>• Hide/delete inappropriate content<br>• View moderation logs        |
| **Premium**   | • Ad-free experience<br>• Early access features<br>• Priority support                       |
| **User**      | • Đọc truyện<br>• Comment & rating<br>• Bookmark<br>• Reading progress                      |

## 🔧 API Endpoints

### **Authentication**

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

### **Stories**

- `GET /api/stories` - Danh sách truyện
- `GET /api/stories/[slug]` - Chi tiết truyện
- `POST /api/stories` - Tạo truyện (admin)

### **Comments**

- `GET /api/comments/story/[id]` - Comments của truyện
- `GET /api/comments/chapter/[id]` - Comments của chương
- `POST /api/comments` - Tạo comment
- `PUT /api/comments/[id]` - Update comment

### **Ratings**

- `GET /api/ratings/[storyId]` - Ratings của truyện
- `POST /api/ratings` - Đánh giá truyện
- `PUT /api/ratings/[id]` - Update rating

## 🎨 UI Components

### **Core Components**

- `CommentSection` - Hệ thống comment đầy đủ
- `RatingSystem` - Rating 5 sao với review
- `StoryCard` - Card hiển thị truyện
- `ChapterList` - Danh sách chương

### **Auth Components**

- `LoginForm` - Form đăng nhập
- `RegisterForm` - Form đăng ký
- `UserProfile` - Profile user

### **Admin Components**

- `AdminDashboard` - Dashboard quản trị
- `ModerationPanel` - Panel moderation
- `UserManagement` - Quản lý user

## 🚧 Development

### **Folder Structure**

```
jianstory/
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # React Components
│   ├── hooks/         # Custom Hooks
│   ├── lib/           # Utilities & Config
│   └── types/         # TypeScript Types
├── database/          # Database Schema
├── scripts/           # Seed & Import Scripts
└── public/           # Static Assets
```

### **Code Standards**

- **TypeScript** cho type safety
- **ESLint + Prettier** cho code formatting
- **Tailwind CSS** cho styling
- **Conventional Commits** cho git messages

### **Database Migration**

```bash
# Chạy migration mới
npm run db:migrate

# Reset database
npm run db:reset

# Seed data
npm run seed
```

## 🔒 Security Features

### **Row Level Security (RLS)**

- Users chỉ có thể xem/edit profile của mình
- Comments được filter theo status
- Admin có quyền truy cập mọi data

### **Authentication Security**

- JWT tokens với auto-refresh
- Server-side session validation
- CSRF protection với middleware

### **Content Moderation**

- Auto-hide reported comments
- Moderation logs tracking
- Spam detection (đang phát triển)

## 📈 Performance

### **Optimizations**

- **Server-side rendering** cho SEO
- **Incremental Static Regeneration** cho content
- **Database indexing** cho queries
- **Image optimization** với Next.js

### **Caching Strategy**

- Supabase built-in caching
- Next.js automatic caching
- Browser caching headers

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Linting
npm run lint
```

## 🚀 Deployment

### **Vercel (Recommended)**

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### **Manual Deployment**

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

## 📞 Support

- **Email**: support@jianstory.com
- **Discord**: [JianStory Community](https://discord.gg/jianstory)
- **Docs**: [docs.jianstory.com](https://docs.jianstory.com)

---

**Built with ❤️ by JianStory Team**

⭐ **Star repo này nếu project hữu ích!**
