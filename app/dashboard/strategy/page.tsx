import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FlaskConical, Play, Clock, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: 'Strategy Lab',
  description: 'Design and test marketing strategies with AI-powered recommendations.',
}

const strategies = [
  {
    id: 1,
    name: "Churn Prevention Campaign",
    segment: "At-Risk Champions",
    status: "running" as const,
    performance: "+23% retention",
  },
  {
    id: 2,
    name: "Upsell High-Value",
    segment: "High-Value Loyalists",
    status: "completed" as const,
    performance: "+$12K revenue",
  },
  {
    id: 3,
    name: "Re-engagement Flow",
    segment: "Dormant Users",
    status: "draft" as const,
    performance: null,
  },
]

export default function StrategyPage() {
  return (
    <div className="flex flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Strategy Lab</h1>
          <p className="text-sm text-muted-foreground">Design and test marketing strategies</p>
        </div>
        <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
          <FlaskConical className="h-4 w-4" />
          New Strategy
        </Button>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Active Strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">3</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Total Revenue Impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">+$48,320</div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Avg. Conversion Lift</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+18%</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Strategies</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your AI-powered marketing campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {strategy.status === "running" ? (
                        <Clock className="h-5 w-5 text-primary animate-pulse" />
                      ) : strategy.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <FlaskConical className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{strategy.name}</p>
                      <p className="text-sm text-muted-foreground">Target: {strategy.segment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {strategy.performance && (
                      <span className="text-sm font-medium text-green-400">{strategy.performance}</span>
                    )}
                    <Badge 
                      variant="secondary"
                      className={
                        strategy.status === "running" 
                          ? "bg-blue-500/20 text-blue-400" 
                          : strategy.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : ""
                      }
                    >
                      {strategy.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Play className="h-4 w-4" />
                      <span className="sr-only">Run strategy</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
