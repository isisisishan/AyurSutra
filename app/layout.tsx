import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const crimsonPro = Crimson_Pro({ subsets: ["latin"], variable: "--font-crimson", display: "swap" });

export const metadata: Metadata = {
  title: "AyurSutra — Holistic AI-Powered Ayurvedic Healthcare",
  description:
    "A clinician-supervised digital health platform combining multilingual Prakriti assessment, intelligent OPD scheduling, and source-cited Ayurvedic clinical decision support.",
  keywords: ["Ayurveda", "AYUSH", "healthcare", "Prakriti", "OPD", "SIH"],
  authors: [{ name: "AyurSutra Team" }],
  openGraph: {
    title: "AyurSutra",
    description: "AI-Powered Ayurvedic Healthcare Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonPro.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
