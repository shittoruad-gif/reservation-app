import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "予約管理システム - 認証",
  description: "ログイン・新規登録",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
