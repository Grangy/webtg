import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaxGroot — Безлимитный интернет для всех устройств",
  description: "Безлимитный интернет с высокой скоростью, защитой данных и поддержкой всех устройств. Подписки от 1 до 12 месяцев.",
  keywords: "интернет, защита данных, обход блокировок, MaxGroot",
  openGraph: {
    title: "MaxGroot",
    description: "Безлимитный интернет для всех устройств",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://grangy.ru" />
        <link rel="dns-prefetch" href="https://telegram.org" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
