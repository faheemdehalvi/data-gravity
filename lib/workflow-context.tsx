'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { WorkflowState, DatasetAnalysis, ClusteringOutput } from './types'

const initialState: WorkflowState = {
  step: 'upload',
  fileName: null,
  fileSize: null,
  rawData: null,
  analysis: null,
  selectedFeatures: null,
  numClusters: 5,
  clusteringOutput: null,
  error: null,
  isLoading: false,
  progress: 0,
  progressMessage: '',
  apiKey: null,
}

type WorkflowAction =
  | { type: 'SET_FILE'; payload: { name: string; size: number } }
  | { type: 'SET_DATA'; payload: Record<string, unknown>[] }
  | { type: 'SET_ANALYSIS'; payload: DatasetAnalysis }
  | { type: 'SET_FEATURES'; payload: string[] }
  | { type: 'SET_NUM_CLUSTERS'; payload: number }
  | { type: 'SET_CLUSTERING_OUTPUT'; payload: ClusteringOutput }
  | { type: 'SET_STEP'; payload: WorkflowState['step'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: { progress: number; message: string } }
  | { type: 'SET_API_KEY'; payload: string | null }
  | { type: 'RESET' }

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, fileName: action.payload.name, fileSize: action.payload.size, error: null }
    case 'SET_DATA':
      return { ...state, rawData: action.payload }
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload }
    case 'SET_FEATURES':
      return { ...state, selectedFeatures: action.payload }
    case 'SET_NUM_CLUSTERS':
      return { ...state, numClusters: action.payload }
    case 'SET_CLUSTERING_OUTPUT':
      return { ...state, clusteringOutput: action.payload }
    case 'SET_STEP':
      return { ...state, step: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload.progress, progressMessage: action.payload.message }
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface WorkflowContextValue {
  state: WorkflowState
  dispatch: React.Dispatch<WorkflowAction>
  // Helper actions
  setFile: (name: string, size: number) => void
  setData: (data: Record<string, unknown>[]) => void
  setAnalysis: (analysis: DatasetAnalysis) => void
  setFeatures: (features: string[]) => void
  setNumClusters: (n: number) => void
  setClusteringOutput: (output: ClusteringOutput) => void
  goToStep: (step: WorkflowState['step']) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  setProgress: (progress: number, message: string) => void
  setApiKey: (key: string | null) => void
  reset: () => void
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState)

  const value: WorkflowContextValue = {
    state,
    dispatch,
    setFile: (name, size) => dispatch({ type: 'SET_FILE', payload: { name, size } }),
    setData: (data) => dispatch({ type: 'SET_DATA', payload: data }),
    setAnalysis: (analysis) => dispatch({ type: 'SET_ANALYSIS', payload: analysis }),
    setFeatures: (features) => dispatch({ type: 'SET_FEATURES', payload: features }),
    setNumClusters: (n) => dispatch({ type: 'SET_NUM_CLUSTERS', payload: n }),
    setClusteringOutput: (output) => dispatch({ type: 'SET_CLUSTERING_OUTPUT', payload: output }),
    goToStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setProgress: (progress, message) => dispatch({ type: 'SET_PROGRESS', payload: { progress, message } }),
    setApiKey: (key) => dispatch({ type: 'SET_API_KEY', payload: key }),
    reset: () => dispatch({ type: 'RESET' }),
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}
