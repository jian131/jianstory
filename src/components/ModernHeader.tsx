'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  MagnifyingGlassIcon,
  UserCircleIcon,
  BookOpenIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function ModernHeader() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [signingOut, setSigningOut] = useState(false)

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: HomeIcon },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Lỗi đăng xuất:', error)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 glass-card border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient hidden sm:block">
                  JianStory
                </span>
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden lg:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm truyện..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </form>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">

              {/* Search Button - Mobile */}
              <button
                type="button"
                className="lg:hidden btn-ghost p-2"
                onClick={() => {
                  const query = prompt('Tìm kiếm truyện:')
                  if (query?.trim()) {
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
                  }
                }}
                title="Tìm kiếm"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Loading state */}
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                  <div className="hidden sm:block w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="w-full h-full text-gray-400" />
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white">
                      {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                    <span className="hidden sm:block">
                      {signingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="btn-ghost px-4 py-2"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary px-4 py-2"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden btn-ghost p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title="Menu"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-card border-t border-gray-800">
            <div className="px-4 py-3 space-y-3">

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm truyện..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </form>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              {user && (
                <>
                  <hr className="border-gray-700" />

                  {/* User Info Mobile */}
                  <div className="px-3 py-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                        {user.user_metadata?.avatar_url ? (
                          <Image
                            src={user.user_metadata.avatar_url}
                            alt="Avatar"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCircleIcon className="w-full h-full text-gray-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-white">
                          {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Logout */}
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md disabled:opacity-50"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                    {signingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
