import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "予約管理システム",
  description: "小規模店舗向けの予約管理Webアプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">
        <Sidebar />
        <main className="ml-56 min-h-screen p-6">{children}</main>
      </body>
    </html>
  );
}
