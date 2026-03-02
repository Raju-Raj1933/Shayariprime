import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SessionWrapper from "@/app/components/SessionWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Shayariprime – Best Shayari, Kavita & Poetry in Hindi",
    template: "%s | Shayariprime",
  },
  description:
    "Shayariprime – Read the best Hindi Shayari, Sad Shayari, Romantic Shayari, and Motivational Kavita. Discover poetry that touches your heart.",
  keywords: [
    "hindi shayari",
    "sad shayari in hindi",
    "love shayari in hindi",
    "romantic shayari",
    "2 line shayari",
    "dard bhari shayari",
    "attitude shayari in hindi",
    "friendship shayari",
    "bewafa shayari",
    "motivational shayari in hindi",
    "life shayari in hindi",
    "pyar bhari shayari"
  ],
  authors: [{ name: "Shayariprime" }],
  creator: "Shayariprime",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://shayariprime.com"
  ),
  openGraph: {
    type: "website",
    siteName: "Shayariprime",
    locale: "hi_IN",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shayariprime - Best Hindi Shayari & Kavita",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@shayariprime",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

import { Inter, Noto_Serif_Devanagari } from "next/font/google";

// ── 2 fonts maximum: 1 for UI, 1 for Hindi poetry ──────────────────────────
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  // 'swap' ensures the text is immediately visible using a fallback layout, achieving instant LCP.
  weight: ["400", "700"],
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-devanagari",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className={`${inter.variable} ${notoSerifDevanagari.variable} ${inter.className}`}>
      <head>
        {/* Preconnect to font CDN so font fetch starts early */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-animated min-h-screen">
        <SessionWrapper>
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,0.06) 0%, transparent 50%)",
            }}
            aria-hidden="true"
          />
          <Header />
          <main className="relative z-10 pt-20 min-h-screen">
            {children}
          </main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1a1030",
                color: "#f0e6ff",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: "12px",
                fontSize: "0.875rem",
              },
              success: { iconTheme: { primary: "#7c3aed", secondary: "#f0e6ff" } },
              error: { iconTheme: { primary: "#ec4899", secondary: "#f0e6ff" } },
            }}
          />
        </SessionWrapper>
      </body>
    </html>
  );
}
