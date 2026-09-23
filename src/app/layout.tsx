import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import { PrefsProvider, prefsBootScript } from "@/components/providers/Prefs";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "sella — chairs that keep up with you",
  description: "Light, playful chairs made from recovered materials. A concept studio site built with Next.js, three.js and GSAP.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1eee9" },
    { media: "(prefers-color-scheme: dark)", color: "#161514" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${interTight.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsBootScript }} />
      </head>
      {/* Extensions (e.g. ColorZilla's cz-shortcut-listen) inject attributes on <body> before hydration. */}
      <body suppressHydrationWarning>
        <PrefsProvider>
          <SmoothScroll />
          {children}
        </PrefsProvider>
      </body>
    </html>
  );
}
