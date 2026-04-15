import type { Metadata } from 'next'
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View and manage your customer segments with AI-powered insights.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
