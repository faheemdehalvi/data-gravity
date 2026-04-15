import { Orbit } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary animate-pulse">
          <Orbit className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    </div>
  )
}
