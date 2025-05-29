'use client'

import { useState, useEffect } from 'react'
import {
  SunIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
  SwatchIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { type ReadingSettings } from '@/types/reading'

interface ReadingSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: ReadingSettings
  onSettingsChange: (settings: ReadingSettings) => void
}

const FONT_FAMILIES = [
  {
    name: 'Times New Roman',
    value: 'Times New Roman, serif',
    vietnamese: true,
    description: 'Font serif cổ điển, dễ đọc cho văn học'
  },
  {
    name: 'Arial',
    value: 'Arial, sans-serif',
    vietnamese: true,
    description: 'Font sans-serif rõ ràng, dễ đọc'
  },
  {
    name: 'Georgia',
    value: 'Georgia, serif',
    vietnamese: true,
    description: 'Font serif đẹp, tối ưu cho màn hình'
  },
  {
    name: 'Verdana',
    value: 'Verdana, sans-serif',
    vietnamese: true,
    description: 'Font dễ đọc ở mọi kích thước'
  },
  {
    name: 'Roboto',
    value: 'Roboto, sans-serif',
    vietnamese: true,
    description: 'Font Google hiện đại, clean'
  },
  {
    name: 'Open Sans',
    value: 'Open Sans, sans-serif',
    vietnamese: true,
    description: 'Font đẹp, dễ đọc cho văn bản dài'
  },
  {
    name: 'Noto Sans Vietnamese',
    value: 'Noto Sans, sans-serif',
    vietnamese: true,
    description: 'Font Google tối ưu cho tiếng Việt'
  },
  {
    name: 'Inter',
    value: 'Inter, sans-serif',
    vietnamese: true,
    description: 'Font hiện đại cho giao diện web'
  },
  {
    name: 'Source Sans Pro',
    value: 'Source Sans Pro, sans-serif',
    vietnamese: true,
    description: 'Font Adobe chuyên nghiệp'
  },
  {
    name: 'Lora',
    value: 'Lora, serif',
    vietnamese: true,
    description: 'Font serif đẹp cho văn bản dài'
  },
  {
    name: 'Playfair Display',
    value: 'Playfair Display, serif',
    vietnamese: true,
    description: 'Font serif sang trọng, cổ điển'
  },
  {
    name: 'Merriweather',
    value: 'Merriweather, serif',
    vietnamese: true,
    description: 'Font serif thoải mái cho đọc lâu'
  },
  {
    name: 'Source Serif Pro',
    value: 'Source Serif Pro, serif',
    vietnamese: true,
    description: 'Font serif Adobe cho văn bản'
  },
  {
    name: 'Crimson Text',
    value: 'Crimson Text, serif',
    vietnamese: true,
    description: 'Font serif cổ điển cho sách'
  },
  {
    name: 'Libre Baskerville',
    value: 'Libre Baskerville, serif',
    vietnamese: true,
    description: 'Font serif kiểu cũ, thanh lịch'
  },
  {
    name: 'Nunito',
    value: 'Nunito, sans-serif',
    vietnamese: true,
    description: 'Font sans-serif tròn, thân thiện'
  },
  {
    name: 'Poppins',
    value: 'Poppins, sans-serif',
    vietnamese: true,
    description: 'Font hiện đại, năng động'
  },
  {
    name: 'Raleway',
    value: 'Raleway, sans-serif',
    vietnamese: true,
    description: 'Font thanh mảnh, tinh tế'
  }
]

const BACKGROUND_THEMES = [
  {
    name: 'Sáng',
    key: 'light',
    background: '#ffffff',
    textColor: '#1f2937',
    description: 'Nền trắng, chữ đen cổ điển'
  },
  {
    name: 'Tối',
    key: 'dark',
    background: '#1f2937',
    textColor: '#f9fafb',
    description: 'Nền đen, chữ trắng'
  },
  {
    name: 'Nâu cổ điển',
    key: 'sepia',
    background: '#f7f3e9',
    textColor: '#8b4513',
    description: 'Màu giấy cũ, ấm áp'
  },
  {
    name: 'Đêm xanh',
    key: 'night',
    background: '#0f172a',
    textColor: '#e2e8f0',
    description: 'Bảo vệ mắt ban đêm'
  },
  {
    name: 'Xanh mint',
    key: 'mint',
    background: '#f0fdf4',
    textColor: '#166534',
    description: 'Xanh lá nhẹ nhàng'
  },
  {
    name: 'Tím lavender',
    key: 'lavender',
    background: '#faf5ff',
    textColor: '#581c87',
    description: 'Tím pastel dịu mắt'
  },
  {
    name: 'Cam ấm',
    key: 'warm',
    background: '#fff7ed',
    textColor: '#c2410c',
    description: 'Màu cam ấm áp'
  },
  {
    name: 'Xám thanh lịch',
    key: 'elegant',
    background: '#f8fafc',
    textColor: '#334155',
    description: 'Xám hiện đại'
  },
  {
    name: 'Đen carbon',
    key: 'carbon',
    background: '#18181b',
    textColor: '#a1a1aa',
    description: 'Đen mịn, chữ xám'
  },
  {
    name: 'Xanh dương',
    key: 'blue',
    background: '#eff6ff',
    textColor: '#1e40af',
    description: 'Xanh dương nhẹ'
  },
  {
    name: 'Hồng pastel',
    key: 'pink',
    background: '#fdf2f8',
    textColor: '#be185d',
    description: 'Hồng nhẹ nhàng'
  },
  {
    name: 'Vàng kem',
    key: 'cream',
    background: '#fffbeb',
    textColor: '#92400e',
    description: 'Vàng kem mềm mại'
  },
  {
    name: 'Xanh ngọc',
    key: 'emerald',
    background: '#ecfdf5',
    textColor: '#047857',
    description: 'Xanh ngọc tươi mát'
  },
  {
    name: 'Tím than',
    key: 'slate',
    background: '#f1f5f9',
    textColor: '#475569',
    description: 'Xám tím nhẹ'
  },
  {
    name: 'Đỏ burgundy',
    key: 'burgundy',
    background: '#fef2f2',
    textColor: '#991b1b',
    description: 'Đỏ đậm cổ điển'
  },
  {
    name: 'Nâu chocolate',
    key: 'chocolate',
    background: '#fdf6e3',
    textColor: '#8b4513',
    description: 'Nâu chocolate ấm'
  },
  {
    name: 'Xanh navy',
    key: 'navy',
    background: '#f8fafc',
    textColor: '#1e3a8a',
    description: 'Xanh navy trang trọng'
  },
  {
    name: 'Tối OLED',
    key: 'oled',
    background: '#000000',
    textColor: '#ffffff',
    description: 'Đen thuần cho màn hình OLED'
  }
]

export default function ReadingSettings({ isOpen, onClose, settings, onSettingsChange }: ReadingSettingsProps) {
  const [activeTab, setActiveTab] = useState<'font' | 'background'>('font')

  useEffect(() => {
    // Load Google Fonts for Vietnamese
    if (typeof window !== 'undefined') {
      const link = document.createElement('link')
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Lora:wght@400;500;600&family=Noto+Sans:wght@300;400;500;600&family=Open+Sans:wght@300;400;500;600&family=Roboto:wght@300;400;500&family=Source+Sans+Pro:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600&family=Merriweather:wght@300;400;700&family=Source+Serif+Pro:wght@400;600&family=Crimson+Text:wght@400;600&family=Libre+Baskerville:wght@400;700&family=Nunito:wght@300;400;600&family=Poppins:wght@300;400;500;600&family=Raleway:wght@300;400;500;600&display=swap'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }, [])

  const handleSettingChange = (key: keyof ReadingSettings, value: any) => {
    const currentTheme = BACKGROUND_THEMES.find(theme => theme.key === settings.theme)

    let newSettings: ReadingSettings = {
      ...settings,
      [key]: value
    }

    // If changing background theme, update related colors
    if (key === 'theme') {
      const theme = BACKGROUND_THEMES.find(t => t.key === value)
      if (theme) {
        newSettings = {
          ...newSettings,
          background: theme.background,
          textColor: theme.textColor,
          theme: value
        }
      }
    }

    onSettingsChange(newSettings)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">⚙️ Cài đặt đọc truyện</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('font')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'font'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DocumentTextIcon className="w-4 h-4 inline mr-2" />
            📝 Font & Kích thước
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'background'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SwatchIcon className="w-4 h-4 inline mr-2" />
            🎨 Nền & Màu sắc
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'font' && (
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📏 Cỡ chữ: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  title={`Cỡ chữ: ${settings.fontSize}px`}
                  aria-label="Điều chỉnh cỡ chữ"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12px (Nhỏ)</span>
                  <span>18px (Vừa)</span>
                  <span>24px (Lớn)</span>
                </div>
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📐 Khoảng cách dòng: {settings.lineHeight}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => handleSettingChange('lineHeight', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  title={`Khoảng cách dòng: ${settings.lineHeight}`}
                  aria-label="Điều chỉnh khoảng cách dòng"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Sít (1.2)</span>
                  <span>Vừa (1.6)</span>
                  <span>Rộng (2.0)</span>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🔤 Font chữ ({FONT_FAMILIES.length} fonts tối ưu tiếng Việt)
                </label>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {FONT_FAMILIES.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => handleSettingChange('fontFamily', font.value)}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        settings.fontFamily === font.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <div className="font-medium text-sm">{font.name}</div>
                      <div className="text-xs text-gray-500 mb-1">{font.description}</div>
                      <div className="text-sm" style={{ fontFamily: font.value }}>
                        Mẫu: Đây là đoạn văn tiếng Việt với dấu âm và dấu thanh: àáảãạ êếểễệ
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'background' && (
            <div className="space-y-6">
              {/* Background Themes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎨 Chủ đề nền ({BACKGROUND_THEMES.length} themes đa dạng)
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                  {BACKGROUND_THEMES.map((theme) => (
                    <button
                      key={theme.key}
                      onClick={() => handleSettingChange('theme', theme.key)}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        settings.theme === theme.key
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className="w-5 h-5 rounded border-2"
                          style={{
                            backgroundColor: theme.background,
                            borderColor: theme.textColor
                          }}
                        />
                        <span className="font-medium text-xs">{theme.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{theme.description}</div>
                      <div
                        className="text-xs p-2 rounded text-center"
                        style={{
                          backgroundColor: theme.background,
                          color: theme.textColor
                        }}
                      >
                        Sample text
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="border-t p-6">
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700">👀 Xem trước:</span>
          </div>
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: settings.background,
              color: settings.textColor,
              fontFamily: settings.fontFamily,
              fontSize: `${settings.fontSize}px`,
              lineHeight: settings.lineHeight
            }}
          >
            <h3 className="font-semibold mb-2">Chương 1: Khởi đầu hành trình</h3>
            <p>
              Đây là đoạn văn mẫu để bạn xem trước cài đặt đọc truyện.
              Văn bản này bao gồm các ký tự tiếng Việt với đầy đủ dấu thanh như:
              à, ả, ã, á, ạ, ă, ằ, ẳ, ẵ, ắ, ặ, â, ầ, ẩ, ẫ, ấ, ậ, đ.
            </p>
            <p className="mt-2">
              Font chữ và màu nền sẽ ảnh hưởng đến trải nghiệm đọc của bạn.
              Hãy chọn cài đặt phù hợp nhất để đọc thoải mái trong thời gian dài.
              Chúc bạn có những giây phút đọc truyện thú vị! 📚✨
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ❌ Đóng
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✅ Áp dụng
          </button>
        </div>
      </div>
    </div>
  )
}
