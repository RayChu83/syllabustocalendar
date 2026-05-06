import type { Metadata } from "next";
import { Figtree, Manrope, Quicksand } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const quicksandFont = Quicksand();
const manropeFont = Manrope();

export const metadata: Metadata = {
  title: "Syllabus To Calendar",
  // include description later
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manropeFont.className}`} id="portal-root">
        {children}
        <Toaster position="bottom-right" closeButton />
      </body>
    </html>
  );
}
