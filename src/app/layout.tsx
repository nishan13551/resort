import type { Metadata, Viewport } from "next";
import { Noto_Sans_Bengali, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { PwaRegister } from "@/components/pwa-register";

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-sans-bengali",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ধানসিঁড়ি রেস্ট হাউজ ম্যানেজমেন্ট সিস্টেম",
  description: "Dhansiri Rest House Management System – একটি সম্পূর্ণ রেস্ট হাউজ ব্যবস্থাপনা সিস্টেম",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Dhansiri Rest House",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={`${notoSansBengali.variable} ${hindSiliguri.variable}`}>
      <body>
        <PwaRegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}