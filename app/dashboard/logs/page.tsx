import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollText, Download, Filter, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"

export const metadata: Metadata = {
  title: 'Deployment Logs',
  description: 'View deployment history and system logs.',
}

const logs = [
  {
    id: 1,
    action: "Cluster Re-computation",
    target: "High-Value Loyalists",
    status: "success" as const,
    timestamp: "2026-04-15 14:32:01",
    duration: "2.3s",
  },
  {
    id: 2,
    action: "Strategy Deployment",
    target: "Churn Prevention Campaign",
    status: "success" as const,
    timestamp: "2026-04-15 14:28:45",
    duration: "1.1s",
  },
  {
    id: 3,
    action: "Data Sync",
    target: "S3://crm-data-bucket",
    status: "success" as const,
    timestamp: "2026-04-15 14:15:00",
    duration: "8.7s",
  },
  {
    id: 4,
    action: "Cluster Re-computation",
    target: "Dormant Users",
    status: "error" as const,
    timestamp: "2026-04-15 13:45:22",
    duration: "0.4s",
  },
  {
    id: 5,
    action: "Model Training",
    target: "K-Means v2.1",
    status: "warning" as const,
    timestamp: "2026-04-15 12:00:00",
    duration: "45.2s",
  },
  {
    id: 6,
    action: "Strategy Deployment",
    target: "Upsell High-Value",
    status: "success" as const,
    timestamp: "2026-04-15 11:30:15",
    duration: "0.9s",
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "success":
      return <Badge className="bg-green-500/20 text-green-400">Success</Badge>
    case "error":
      return <Badge variant="destructive">Error</Badge>
    case "warning":
      return <Badge className="bg-yellow-500/20 text-yellow-400">Warning</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function LogsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Deployment Logs</h1>
          <p className="text-sm text-muted-foreground">System activity and deployment history</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ScrollText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Last 24 hours of system operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status)}
                    <div>
                      <p className="font-medium text-foreground">{log.action}</p>
                      <p className="text-sm text-muted-foreground">{log.target}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden text-xs text-muted-foreground sm:block">{log.duration}</span>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    {getStatusBadge(log.status)}
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
