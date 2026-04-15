'use client'

import { useState } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, Target, TrendingUp, BarChart3, Download, RotateCcw, 
  ChevronRight, Lightbulb, ArrowUpRight, Sparkles
} from 'lucide-react'
import type { ClusterResult } from '@/lib/types'

const CLUSTER_COLORS = [
  'bg-chart-1',
  'bg-chart-2', 
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
  'bg-primary',
  'bg-accent',
  'bg-destructive',
  'bg-muted-foreground',
  'bg-foreground',
]

export function ClusterResults() {
  const { state, reset } = useWorkflow()
  const { clusteringOutput, rawData, selectedFeatures } = state
  const [selectedCluster, setSelectedCluster] = useState<ClusterResult | null>(null)
  
  if (!clusteringOutput || !rawData) return null
  
  const { clusters, silhouetteScore, featureImportance } = clusteringOutput
  const totalCustomers = rawData.length
  
  const qualityLabel = silhouetteScore > 0.5 ? 'Excellent' : silhouetteScore > 0.35 ? 'Good' : silhouetteScore > 0.2 ? 'Fair' : 'Weak'
  const qualityColor = silhouetteScore > 0.5 ? 'text-chart-2' : silhouetteScore > 0.35 ? 'text-chart-1' : silhouetteScore > 0.2 ? 'text-chart-3' : 'text-destructive'
  
  const downloadResults = () => {
    const results = {
      summary: {
        totalCustomers,
        numClusters: clusters.length,
        silhouetteScore,
        features: selectedFeatures,
      },
      clusters: clusters.map(c => ({
        name: c.name,
        size: c.size,
        percentage: ((c.size / totalCustomers) * 100).toFixed(1) + '%',
        description: c.businessDescription,
        characteristics: c.characteristics,
        recommendedActions: c.recommendedActions,
      })),
      featureImportance
    }
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cluster-results.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{totalCustomers.toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{clusters.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Segments Created</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className={`text-2xl font-bold ${qualityColor}`}>{(silhouetteScore * 100).toFixed(0)}%</span>
            </div>
            <p className="text-sm text-muted-foreground">Cluster Quality ({qualityLabel})</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{selectedFeatures?.length}</span>
            </div>
            <p className="text-sm text-muted-foreground">Features Used</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="segments" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="features">Feature Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="segments" className="space-y-6">
          {/* Cluster cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clusters.map((cluster, idx) => {
              const percentage = (cluster.size / totalCustomers) * 100
              
              return (
                <Card 
                  key={cluster.id}
                  className={`border-border bg-card/50 backdrop-blur-sm cursor-pointer transition-all hover:border-primary/50 ${
                    selectedCluster?.id === cluster.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCluster(selectedCluster?.id === cluster.id ? null : cluster)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${CLUSTER_COLORS[idx % CLUSTER_COLORS.length]}`} />
                        <CardTitle className="text-base text-foreground">{cluster.name}</CardTitle>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                        selectedCluster?.id === cluster.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                    <CardDescription className="line-clamp-2">
                      {cluster.businessDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-medium text-foreground">
                          {cluster.size.toLocaleString()} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {cluster.characteristics.slice(0, 3).map((char, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {char.length > 25 ? char.slice(0, 25) + '...' : char}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* Expanded cluster details */}
          {selectedCluster && (
            <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-foreground">{selectedCluster.name}</CardTitle>
                </div>
                <CardDescription>{selectedCluster.businessDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="mb-2 font-medium text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Key Characteristics
                  </h4>
                  <ul className="space-y-1">
                    {selectedCluster.characteristics.map((char, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="mb-2 font-medium text-foreground flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-chart-3" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {selectedCluster.recommendedActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowUpRight className="mt-0.5 h-4 w-4 text-chart-2 shrink-0" />
                        <span className="text-muted-foreground">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Badge variant="secondary">
                    {selectedCluster.size.toLocaleString()} customers
                  </Badge>
                  <Badge variant="secondary">
                    {((selectedCluster.size / totalCustomers) * 100).toFixed(1)}% of total
                  </Badge>
                  <Badge variant="secondary">
                    Cohesion: {(selectedCluster.metrics.cohesion * 100).toFixed(0)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="features" className="space-y-6">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Feature Importance</CardTitle>
              <CardDescription>
                Which features contributed most to differentiating the clusters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featureImportance.map((f, idx) => (
                <div key={f.feature} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{f.feature}</span>
                    <span className="text-muted-foreground">{(f.importance * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={f.importance * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Clustering Quality</CardTitle>
              <CardDescription>
                How well-separated are the customer segments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Silhouette Score</span>
                <span className={`text-lg font-bold ${qualityColor}`}>
                  {silhouetteScore.toFixed(3)}
                </span>
              </div>
              <Progress value={silhouetteScore * 100} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {silhouetteScore > 0.5 
                  ? 'Excellent cluster separation. Segments are well-defined and distinct.'
                  : silhouetteScore > 0.35
                    ? 'Good cluster separation. Segments are reasonably distinct.'
                    : silhouetteScore > 0.2
                      ? 'Fair cluster separation. Some overlap between segments exists.'
                      : 'Weak cluster separation. Consider using different features or fewer clusters.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start New Analysis
        </Button>
        <Button onClick={downloadResults}>
          <Download className="mr-2 h-4 w-4" />
          Download Results
        </Button>
      </div>
    </div>
  )
}
