import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GlobalHeader } from "@/components/GlobalHeader";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovelVerse",
  description: "Personal, single-user novel reading and management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <GlobalHeader />
          <main className="flex-1 flex flex-col items-center">
            {/* The page containers have individual widths as per docs, but layout provides central flex-1 structure */}
            <Suspense
              fallback={
                <div className="p-8 text-slate-500 m-auto">Loading...</div>
              }
            >
              {children}
            </Suspense>
          </main>
        </Providers>
      </body>
    </html>
  );
}
