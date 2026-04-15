import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Layers, Plus, RefreshCcw, Settings2 } from "lucide-react"

export const metadata: Metadata = {
  title: 'Clusters',
  description: 'Manage and configure your customer segmentation clusters.',
}

const clusters = [
  { 
    id: 1, 
    name: "High-Value Loyalists", 
    algorithm: "K-Means", 
    features: 12,
    lastRun: "2 hours ago",
    status: "active" as const,
  },
  { 
    id: 2, 
    name: "At-Risk Champions", 
    algorithm: "K-Means", 
    features: 8,
    lastRun: "2 hours ago",
    status: "active" as const,
  },
  { 
    id: 3, 
    name: "New Potential", 
    algorithm: "DBSCAN", 
    features: 6,
    lastRun: "1 day ago",
    status: "pending" as const,
  },
  { 
    id: 4, 
    name: "Casual Browsers", 
    algorithm: "K-Means", 
    features: 10,
    lastRun: "2 hours ago",
    status: "active" as const,
  },
  { 
    id: 5, 
    name: "Dormant Users", 
    algorithm: "Hierarchical", 
    features: 5,
    lastRun: "3 days ago",
    status: "error" as const,
  },
]

export default function ClustersPage() {
  return (
    <div className="flex flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Clusters</h1>
          <p className="text-sm text-muted-foreground">Manage your segmentation models</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Re-run All
          </Button>
          <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
            <Plus className="h-4 w-4" />
            New Cluster
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clusters.map((cluster) => (
            <Card key={cluster.id} className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <Badge 
                    variant={cluster.status === "active" ? "default" : cluster.status === "error" ? "destructive" : "secondary"}
                    className={cluster.status === "active" ? "bg-green-500/20 text-green-400" : ""}
                  >
                    {cluster.status}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-foreground">{cluster.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {cluster.algorithm} with {cluster.features} features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Last run: {cluster.lastRun}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="h-4 w-4" />
                    <span className="sr-only">Configure cluster</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
