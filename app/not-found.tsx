"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Orbit, ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_40%,transparent_100%)]" />

      <div className="relative z-10 text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Orbit className="h-8 w-8 text-primary" />
        </div>

        <h1 className="mb-4 text-7xl font-bold text-foreground">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          The page you are looking for does not exist or has been moved. 
          Check the URL or navigate back to a known location.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 border-border" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
