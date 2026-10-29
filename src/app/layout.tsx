import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Leke Quni · Portfolio", template: "%s · Leke Quni" },
  description: "Portfolio of Leke Quni: solo and team projects.",
  keywords: ["Leke", "Leke Quni", "portfolio", "projects"],
  authors: [{ name: "Leke Quni" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Leke Quni · Portfolio",
    title: "Leke Quni · Portfolio",
    description: "Portfolio of Leke Quni: solo and team projects.",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
