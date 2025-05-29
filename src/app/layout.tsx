import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import ModernHeader from "@/components/ModernHeader";
import { AuthProvider } from "@/lib/auth-context";
import { HydrationFix } from "@/components/HydrationFix";

export const metadata: Metadata = {
  title: "JianStory - Đọc truyện online",
  description: "Nền tảng đọc truyện online miễn phí với giao diện hiện đại",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={GeistSans.className}>
      <head>
        <HydrationFix />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ModernHeader />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
