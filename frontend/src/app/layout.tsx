import type { Metadata } from "next";
import "./globals.css";

import { auth } from "@/auth";
import { AppSessionProvider } from "@/components/AppSessionProvider";

export const metadata: Metadata = {
  title: "Writer Assistant",
  description: "AI-помощник для писателей",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ru">
      <body className="min-h-screen antialiased">
        <AppSessionProvider session={session}>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
