'use client'

import { WorkflowProvider, useWorkflow } from '@/lib/workflow-context'
import { DashboardHeader } from '@/components/dashboard/header'
import { UploadZone } from '@/components/intelligence/upload-zone'
import { DataPreview } from '@/components/intelligence/data-preview'
import { FeatureSelector } from '@/components/intelligence/feature-selector'
import { ProcessingView } from '@/components/intelligence/processing-view'
import { ClusterResults } from '@/components/intelligence/cluster-results'
import { ApiKeyBanner } from '@/components/intelligence/api-key-banner'
import { Badge } from '@/components/ui/badge'
import { Brain, Upload, Eye, Settings2, Loader2, BarChart3 } from 'lucide-react'

const STEPS = [
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'features', label: 'Features', icon: Settings2 },
  { key: 'processing', label: 'Processing', icon: Loader2 },
  { key: 'results', label: 'Results', icon: BarChart3 },
] as const

function WorkflowStepper() {
  const { state } = useWorkflow()
  const currentIdx = STEPS.findIndex(s => s.key === state.step)
  
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {STEPS.map((step, idx) => {
        const Icon = step.icon
        const isActive = step.key === state.step
        const isComplete = idx < currentIdx
        const isPending = idx > currentIdx
        
        return (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors ${
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : isComplete 
                  ? 'bg-chart-2/20 text-chart-2'
                  : 'bg-muted text-muted-foreground'
            }`}>
              <Icon className={`h-4 w-4 ${isActive && step.key === 'processing' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`mx-2 h-px w-8 ${
                isComplete ? 'bg-chart-2' : 'bg-border'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function WorkflowContent() {
  const { state, setApiKey } = useWorkflow()
  
  return (
    <div className="flex flex-col gap-4">
      <ApiKeyBanner onKeyChange={setApiKey} />
      {state.step === 'upload' && <UploadZone />}
      {state.step === 'preview' && <DataPreview />}
      {state.step === 'features' && <FeatureSelector />}
      {state.step === 'processing' && <ProcessingView />}
      {state.step === 'results' && <ClusterResults />}
    </div>
  )
}

export default function IntelligencePage() {
  return (
    <WorkflowProvider>
      <div className="flex flex-col">
        <DashboardHeader />
        
        <div className="flex-1 p-6">
          {/* Page header */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Customer Intelligence Engine</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered customer segmentation from your data
                </p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit bg-primary/10 text-primary border-primary/30">
              Hybrid ML + LLM
            </Badge>
          </div>
          
          {/* Stepper */}
          <WorkflowStepper />
          
          {/* Main content */}
          <div className="mx-auto max-w-5xl py-6">
            <WorkflowContent />
          </div>
        </div>
      </div>
    </WorkflowProvider>
  )
}
