import type { Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, Bebas_Neue, Fraunces, Lobster, Work_Sans } from "next/font/google";
import "./globals.css";

/* Root shell shared by the site and the embedded Studio. The site's
   chrome lives in app/(site)/layout.tsx. */

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-bebas-neue",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

/* Header nav pills and the Ask May button. */
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

/* The text wordmark shown until a logo image is uploaded. */
const lobster = Lobster({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-lobster",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6efe3",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${bebasNeue.variable} ${workSans.variable} ${anton.variable} ${lobster.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* marks JS as available before first paint, so scroll reveals only
            ever hide content from visitors who will see them play */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
