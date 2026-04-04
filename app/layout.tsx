import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "自由時間トラッカー",
  description: "夫婦の自由時間を記録・管理するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
