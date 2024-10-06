import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/react"
import FlameStar from './flame-star.webp'
import { cookies } from "next/headers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Roasting AI",
    default: "Roasting AI", 
  },
  description: "AI akan meroasting sesuai profil kamu",
  openGraph: {
      title: 'Roasting AI',
      description: 'ingin diroasting? kamu yakin, yuk kesini.',
      type: 'website',
  },
  icons: FlameStar.src,
  robots: {
      index: true,
      follow: true,
      googleBot: {
          index: true,
          follow: true,
      },
  },
  authors: {
    url: 'https://github.com/Davidaprilio',
    name: 'David Aprilio',
  }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = cookies().get('theme')

  return (
    <html lang="en" className={theme?.value}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      {process.env.NEXT_PUBLIC_USE_ANALYTICS_PROVIDER === "GA4" ? (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      ) : process.env.NEXT_PUBLIC_USE_ANALYTICS_PROVIDER === "Vercel" ? (
        <Analytics/>
      ) : null}
    </html>
  );
}
