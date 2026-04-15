'use client'

import { useEffect, useRef } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Database, Cpu, Brain, CheckCircle2 } from 'lucide-react'
import { runClusteringPipeline } from '@/lib/ml'
import type { ClusteringOutput, ClusterResult } from '@/lib/types'

const STAGES = [
  { key: 'scaling', label: 'Scaling Features', icon: Database },
  { key: 'pca', label: 'Dimensionality Reduction', icon: Cpu },
  { key: 'clustering', label: 'K-Means Clustering', icon: Cpu },
  { key: 'analyzing', label: 'Analyzing Clusters', icon: Brain },
  { key: 'interpreting', label: 'Generating Insights', icon: Brain },
  { key: 'complete', label: 'Complete', icon: CheckCircle2 },
]

export function ProcessingView() {
  const { state, setClusteringOutput, goToStep, setError, setProgress } = useWorkflow()
  const { rawData, selectedFeatures, numClusters, progress, progressMessage, apiKey } = state
  const hasStarted = useRef(false)
  
  useEffect(() => {
    if (hasStarted.current || !rawData || !selectedFeatures) return
    hasStarted.current = true
    
    async function runPipeline() {
      try {
        // Run ML pipeline
        const result = runClusteringPipeline(
          rawData as Record<string, unknown>[],
          selectedFeatures as string[],
          numClusters,
          (stage, prog) => setProgress(prog, stage)
        )
        
        setProgress(85, 'interpreting')
        
        // Get LLM insights for clusters
        const insightsRes = await fetch('/api/intelligence/generate-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-openai-key': apiKey } : {}),
          },
          body: JSON.stringify({
            rawClusters: result.rawClusters,
            featureNames: selectedFeatures,
            featureImportance: result.featureImportance,
            silhouetteScore: result.silhouetteScore,
            totalCustomers: (rawData as Record<string, unknown>[]).length
          })
        })
        
        if (!insightsRes.ok) {
          throw new Error('Failed to generate cluster insights')
        }
        
        const { clusters } = await insightsRes.json() as { clusters: ClusterResult[] }
        
        setProgress(100, 'complete')
        
        const output: ClusteringOutput = {
          clusters,
          labels: result.labels,
          silhouetteScore: result.silhouetteScore,
          inertia: result.inertia,
          featureImportance: result.featureImportance,
          pcaVarianceExplained: result.pcaVarianceExplained
        }
        
        setClusteringOutput(output)
        
        // Small delay to show completion state
        await new Promise(r => setTimeout(r, 500))
        goToStep('results')
        
      } catch (err) {
        console.error('[v0] Pipeline error:', err)
        setError(err instanceof Error ? err.message : 'Clustering failed')
        goToStep('features')
      }
    }
    
    runPipeline()
  }, [rawData, selectedFeatures, numClusters, setClusteringOutput, goToStep, setError, setProgress])
  
  const currentStageIdx = STAGES.findIndex(s => s.key === progressMessage) 
  
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-foreground">Processing Your Data</CardTitle>
          <CardDescription>
            Running AI-powered clustering analysis on {rawData?.length.toLocaleString()} customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-muted-foreground">{progress}% complete</p>
          </div>
          
          {/* Stage indicators */}
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon
              const isActive = progressMessage === stage.key
              const isComplete = currentStageIdx > idx || progressMessage === 'complete'
              
              return (
                <div
                  key={stage.key}
                  className={`flex items-center gap-4 rounded-lg border p-4 transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/5' 
                      : isComplete
                        ? 'border-chart-2/30 bg-chart-2/5'
                        : 'border-border opacity-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isActive 
                      ? 'bg-primary/20' 
                      : isComplete 
                        ? 'bg-chart-2/20'
                        : 'bg-muted'
                  }`}>
                    {isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-chart-2" />
                    ) : (
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      isActive ? 'text-foreground' : isComplete ? 'text-chart-2' : 'text-muted-foreground'
                    }`}>
                      {stage.label}
                    </p>
                    {isActive && (
                      <p className="text-sm text-muted-foreground">In progress...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Config summary */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Using {selectedFeatures?.length} features to create {numClusters} customer segments</p>
      </div>
    </div>
  )
}
