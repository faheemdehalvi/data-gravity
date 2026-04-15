'use client'

import { useEffect, useState } from 'react'
import { useWorkflow } from '@/lib/workflow-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Info, AlertTriangle } from 'lucide-react'
import type { FeatureRecommendation } from '@/lib/types'

export function FeatureSelector() {
  const { state, goToStep, setFeatures, setNumClusters, setError } = useWorkflow()
  const { analysis, numClusters } = state
  
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [recommendation, setRecommendation] = useState<FeatureRecommendation | null>(null)
  const [isLoadingRec, setIsLoadingRec] = useState(false)
  
  const numericColumns = analysis?.columns.filter(c => c.type === 'numeric') ?? []
  
  // Fetch AI recommendations on mount
  useEffect(() => {
    async function fetchRecommendation() {
      if (!analysis || numericColumns.length === 0) return
      
      setIsLoadingRec(true)
      try {
        const res = await fetch('/api/intelligence/analyze-dataset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysis })
        })
        
        if (!res.ok) throw new Error('Failed to get recommendations')
        
        const data = await res.json()
        if (data.recommendation) {
          setRecommendation(data.recommendation)
          // Auto-select recommended features
          setSelected(new Set(data.recommendation.columns))
        }
      } catch (err) {
        console.error('[v0] Failed to fetch feature recommendations:', err)
        // Fallback: select first 4 numeric columns
        setSelected(new Set(numericColumns.slice(0, 4).map(c => c.name)))
      } finally {
        setIsLoadingRec(false)
      }
    }
    
    fetchRecommendation()
  }, [analysis, numericColumns])
  
  const toggleFeature = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }
  
  const handleContinue = () => {
    if (selected.size < 2) {
      setError('Please select at least 2 features for clustering')
      return
    }
    
    setFeatures(Array.from(selected))
    goToStep('processing')
  }
  
  const applyRecommendation = () => {
    if (recommendation) {
      setSelected(new Set(recommendation.columns))
    }
  }
  
  return (
    <div className="space-y-6">
      {/* AI Recommendation */}
      <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base text-foreground">AI Recommendation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRec ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing your dataset...</span>
            </div>
          ) : recommendation ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
              <div className="flex flex-wrap gap-2">
                {recommendation.columns.map(col => (
                  <Badge key={col} variant="secondary" className="bg-primary/10 text-primary">
                    {col}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={applyRecommendation}>
                Apply Recommendation
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select numeric features that best represent customer differences.
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Feature Selection */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Select Features</CardTitle>
          <CardDescription>
            Choose numeric columns to use for clustering. Features should capture meaningful customer differences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {numericColumns.map((col) => {
              const isSelected = selected.has(col.name)
              const isRecommended = recommendation?.columns.includes(col.name)
              
              return (
                <div
                  key={col.name}
                  className={`flex items-start gap-3 rounded-lg border p-4 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleFeature(col.name)}
                >
                  <Checkbox
                    id={col.name}
                    checked={isSelected}
                    onCheckedChange={() => toggleFeature(col.name)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={col.name} className="text-sm font-medium text-foreground cursor-pointer">
                        {col.name}
                      </Label>
                      {isRecommended && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    {col.stats && (
                      <p className="text-xs text-muted-foreground">
                        Range: {col.stats.min?.toFixed(1)} - {col.stats.max?.toFixed(1)} | 
                        Avg: {col.stats.mean?.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {selected.size < 2 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <span>Select at least 2 features for clustering</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Number of Clusters */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Number of Clusters</CardTitle>
          <CardDescription>
            How many customer segments do you want to create?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Slider
              value={[numClusters]}
              onValueChange={([val]) => setNumClusters(val)}
              min={2}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="w-12 text-center text-2xl font-bold text-primary">{numClusters}</span>
          </div>
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Start with 3-5 clusters for most datasets. Too few may oversimplify, 
              too many may create segments that are hard to act on.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => goToStep('preview')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Preview
        </Button>
        <Button onClick={handleContinue} disabled={selected.size < 2}>
          Run Clustering
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {state.error && (
        <p className="text-center text-sm text-destructive">{state.error}</p>
      )}
    </div>
  )
}
