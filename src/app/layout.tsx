import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clearmark - Remove Watermark",
  description: "Remove Watermark from images",
  twitter: {
    card: "summary_large_image",
    title: "Clearmark - Remove Watermark",
    description: "Clean up your images by removing watermarks instantly",
    images: [
      {
        url: "/twitter.jpg",
      },
    ],
  },
  openGraph: {
    title: "Clearmark - Remove Watermark",
    description: "Clean up your images by removing watermarks instantly",
    images: [
      {
        url: "/twitter.jpg",
        width: 1200,
        height: 630,
        alt: "Clearmark - Remove Watermark",
      },
    ],
    siteName: "Clearmark",
    type: "website",
  },
  other: {
    "telegram-channel:image": "/telegram.jpg",
    "og:image:width": "1200",
    "og:image:height": "630",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
