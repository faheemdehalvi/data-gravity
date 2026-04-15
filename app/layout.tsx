import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans"
});
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: {
    default: 'Data Gravity | AI-Powered CRM Segmentation for AWS',
    template: '%s | Data Gravity',
  },
  description: 'The first Zero-Copy CRM intelligence engine built for the AWS ecosystem. AI-powered customer segmentation with native AWS integration.',
  keywords: ['CRM', 'AWS', 'customer segmentation', 'AI', 'machine learning', 'zero-copy', 'data analytics', 'customer intelligence'],
  authors: [{ name: 'Data Gravity' }],
  creator: 'Data Gravity',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://data-gravity.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Data Gravity',
    title: 'Data Gravity | AI-Powered CRM Segmentation for AWS',
    description: 'The first Zero-Copy CRM intelligence engine built for the AWS ecosystem. Transform raw customer data into actionable segments.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Data Gravity | AI-Powered CRM Segmentation',
    description: 'Zero-Copy CRM intelligence engine for AWS. Transform customer data into actionable segments.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#050505' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
