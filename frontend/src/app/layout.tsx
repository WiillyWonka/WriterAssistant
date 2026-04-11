import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Writer Assistant",
  description: "AI-помощник для писателей",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
