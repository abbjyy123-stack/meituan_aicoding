import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "社团招新智能匹配平台",
  description: "新生与社团的智能匹配与管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
