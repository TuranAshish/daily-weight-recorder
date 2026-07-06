import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Weight Recorder",
  description:
    "A modern no-ads daily weight tracker for recording kilograms, viewing progress, and staying consistent.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest",
  themeColor: "#10B981"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
