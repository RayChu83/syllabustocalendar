import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import localFont from "next/font/local";

export const stackSans = localFont({
  src: "./fonts/StackSans.ttf",
  variable: "--font-stack-sans",
  adjustFontFallback: false,
});

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
    <html lang="en" className={cn("font-sans", stackSans.variable)}>
      <body className={`${stackSans.className}`} id="portal-root">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-right" closeButton />
      </body>
    </html>
  );
}
