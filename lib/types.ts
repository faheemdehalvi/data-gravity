// Customer Intelligence Engine Types

export interface DatasetColumn {
  name: string
  type: 'numeric' | 'categorical' | 'text' | 'date' | 'boolean'
  nullCount: number
  uniqueCount: number
  sample: string[]
  stats?: {
    min?: number
    max?: number
    mean?: number
    stdDev?: number
  }
}

export interface DatasetAnalysis {
  rowCount: number
  columnCount: number
  columns: DatasetColumn[]
  summary: string
}

export interface FeatureRecommendation {
  columns: string[]
  reasoning: string
  confidence: number
}

export interface ClusterResult {
  id: number
  name: string
  size: number
  centroid: number[]
  characteristics: string[]
  businessDescription: string
  recommendedActions: string[]
  metrics: {
    avgDistance: number
    cohesion: number
  }
}

export interface ClusteringOutput {
  clusters: ClusterResult[]
  labels: number[]
  silhouetteScore: number
  inertia: number
  featureImportance: { feature: string; importance: number }[]
  pcaVarianceExplained: number[]
}

export interface WorkflowState {
  step: 'upload' | 'preview' | 'features' | 'processing' | 'results'
  fileName: string | null
  fileSize: number | null
  rawData: Record<string, unknown>[] | null
  analysis: DatasetAnalysis | null
  selectedFeatures: string[] | null
  numClusters: number
  clusteringOutput: ClusteringOutput | null
  error: string | null
  isLoading: boolean
  progress: number
  progressMessage: string
  apiKey: string | null
}

export interface ProcessingUpdate {
  progress: number
  message: string
  stage: 'parsing' | 'analyzing' | 'scaling' | 'pca' | 'clustering' | 'interpreting' | 'complete'
}

// Demo dataset structure
export interface DemoCustomer {
  customer_id: string
  age: number
  annual_income: number
  spending_score: number
  membership_years: number
  purchase_frequency: number
  avg_purchase_value: number
  total_purchases: number
  last_purchase_days_ago: number
  support_tickets: number
  website_visits: number
  email_opens: number
  preferred_category: string
  region: string
}
