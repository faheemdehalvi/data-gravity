// Customer Intelligence Engine - ML Pipeline
// Pure TypeScript implementation - no external ML dependencies

import type { DatasetColumn, DatasetAnalysis, ClusteringOutput, ClusterResult } from './types'

// === Data Parsing & Analysis ===

export function parseCSV(csvText: string): Record<string, unknown>[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) throw new Error('CSV must have at least a header and one data row')
  
  const headers = parseCSVLine(lines[0])
  const data: Record<string, unknown>[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length !== headers.length) continue
    
    const row: Record<string, unknown> = {}
    headers.forEach((header, idx) => {
      const val = values[idx].trim()
      // Try to parse as number
      const num = parseFloat(val)
      row[header] = isNaN(num) ? val : num
    })
    data.push(row)
  }
  
  return data
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  
  return result
}

export function analyzeDataset(data: Record<string, unknown>[]): DatasetAnalysis {
  if (data.length === 0) throw new Error('Dataset is empty')
  
  const columns: DatasetColumn[] = []
  const columnNames = Object.keys(data[0])
  
  for (const name of columnNames) {
    const values = data.map(row => row[name])
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
    const uniqueValues = new Set(nonNullValues.map(v => String(v)))
    
    // Determine type
    const numericValues = nonNullValues.filter(v => typeof v === 'number')
    const isNumeric = numericValues.length > nonNullValues.length * 0.9
    
    let type: DatasetColumn['type'] = 'text'
    if (isNumeric) {
      type = 'numeric'
    } else if (uniqueValues.size <= 20 && uniqueValues.size < nonNullValues.length * 0.5) {
      type = 'categorical'
    }
    
    const column: DatasetColumn = {
      name,
      type,
      nullCount: values.length - nonNullValues.length,
      uniqueCount: uniqueValues.size,
      sample: Array.from(uniqueValues).slice(0, 5).map(String),
    }
    
    if (type === 'numeric') {
      const nums = numericValues as number[]
      const sum = nums.reduce((a, b) => a + b, 0)
      const mean = sum / nums.length
      const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / nums.length
      
      column.stats = {
        min: Math.min(...nums),
        max: Math.max(...nums),
        mean,
        stdDev: Math.sqrt(variance),
      }
    }
    
    columns.push(column)
  }
  
  return {
    rowCount: data.length,
    columnCount: columns.length,
    columns,
    summary: `Dataset with ${data.length} rows and ${columns.length} columns. ${columns.filter(c => c.type === 'numeric').length} numeric features available for clustering.`
  }
}

// === Feature Scaling ===

export function standardScale(data: number[][]): { scaled: number[][], means: number[], stds: number[] } {
  const numFeatures = data[0].length
  const means: number[] = []
  const stds: number[] = []
  
  // Calculate means and stds
  for (let j = 0; j < numFeatures; j++) {
    const col = data.map(row => row[j])
    const mean = col.reduce((a, b) => a + b, 0) / col.length
    const variance = col.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / col.length
    means.push(mean)
    stds.push(Math.sqrt(variance) || 1) // Avoid division by zero
  }
  
  // Scale
  const scaled = data.map(row => 
    row.map((val, j) => (val - means[j]) / stds[j])
  )
  
  return { scaled, means, stds }
}

// === PCA Implementation ===

export function pca(data: number[][], numComponents: number): { 
  transformed: number[][], 
  varianceExplained: number[],
  loadings: number[][]
} {
  const n = data.length
  const m = data[0].length
  const k = Math.min(numComponents, m)
  
  // Center the data (already scaled, but ensure centered)
  const means = Array(m).fill(0).map((_, j) => 
    data.reduce((sum, row) => sum + row[j], 0) / n
  )
  const centered = data.map(row => row.map((val, j) => val - means[j]))
  
  // Compute covariance matrix
  const cov = Array(m).fill(0).map(() => Array(m).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0
      for (let r = 0; r < n; r++) {
        sum += centered[r][i] * centered[r][j]
      }
      cov[i][j] = sum / (n - 1)
      cov[j][i] = cov[i][j]
    }
  }
  
  // Power iteration for eigendecomposition (simplified)
  const eigenPairs = powerIteration(cov, k)
  
  // Project data
  const transformed = centered.map(row => 
    eigenPairs.map(({ vector }) => 
      row.reduce((sum, val, i) => sum + val * vector[i], 0)
    )
  )
  
  const totalVariance = eigenPairs.reduce((sum, e) => sum + e.value, 0) || 1
  const varianceExplained = eigenPairs.map(e => e.value / totalVariance)
  
  return { 
    transformed, 
    varianceExplained,
    loadings: eigenPairs.map(e => e.vector)
  }
}

function powerIteration(matrix: number[][], k: number): { value: number, vector: number[] }[] {
  const n = matrix.length
  const results: { value: number, vector: number[] }[] = []
  const matCopy = matrix.map(row => [...row])
  
  for (let comp = 0; comp < k; comp++) {
    let vector = Array(n).fill(0).map(() => Math.random() - 0.5)
    let eigenvalue = 0
    
    // Power iteration
    for (let iter = 0; iter < 100; iter++) {
      // Multiply matrix by vector
      const newVector = Array(n).fill(0)
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newVector[i] += matCopy[i][j] * vector[j]
        }
      }
      
      // Calculate norm (eigenvalue estimate)
      eigenvalue = Math.sqrt(newVector.reduce((sum, v) => sum + v * v, 0))
      if (eigenvalue === 0) break
      
      // Normalize
      vector = newVector.map(v => v / eigenvalue)
    }
    
    results.push({ value: eigenvalue, vector })
    
    // Deflate matrix
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        matCopy[i][j] -= eigenvalue * vector[i] * vector[j]
      }
    }
  }
  
  return results
}

// === K-Means Clustering ===

export function kMeans(data: number[][], k: number, maxIterations: number = 100): {
  labels: number[],
  centroids: number[][],
  inertia: number
} {
  const n = data.length
  const dims = data[0].length
  
  // Initialize centroids using k-means++
  const centroids = initCentroidsKMeansPlusPlus(data, k)
  let labels = Array(n).fill(0)
  let inertia = Infinity
  
  for (let iter = 0; iter < maxIterations; iter++) {
    // Assignment step
    const newLabels: number[] = []
    let newInertia = 0
    
    for (let i = 0; i < n; i++) {
      let minDist = Infinity
      let minLabel = 0
      
      for (let c = 0; c < k; c++) {
        const dist = euclideanDistance(data[i], centroids[c])
        if (dist < minDist) {
          minDist = dist
          minLabel = c
        }
      }
      
      newLabels.push(minLabel)
      newInertia += minDist * minDist
    }
    
    // Check convergence
    if (newLabels.every((l, i) => l === labels[i])) {
      labels = newLabels
      inertia = newInertia
      break
    }
    
    labels = newLabels
    inertia = newInertia
    
    // Update step
    for (let c = 0; c < k; c++) {
      const clusterPoints = data.filter((_, i) => labels[i] === c)
      if (clusterPoints.length === 0) continue
      
      for (let d = 0; d < dims; d++) {
        centroids[c][d] = clusterPoints.reduce((sum, p) => sum + p[d], 0) / clusterPoints.length
      }
    }
  }
  
  return { labels, centroids, inertia }
}

function initCentroidsKMeansPlusPlus(data: number[][], k: number): number[][] {
  const n = data.length
  const centroids: number[][] = []
  
  // First centroid: random
  centroids.push([...data[Math.floor(Math.random() * n)]])
  
  // Remaining centroids: weighted probability by squared distance
  for (let c = 1; c < k; c++) {
    const distances = data.map(point => {
      const minDist = Math.min(...centroids.map(cent => euclideanDistance(point, cent)))
      return minDist * minDist
    })
    
    const totalDist = distances.reduce((a, b) => a + b, 0)
    let r = Math.random() * totalDist
    
    for (let i = 0; i < n; i++) {
      r -= distances[i]
      if (r <= 0) {
        centroids.push([...data[i]])
        break
      }
    }
    
    // Fallback
    if (centroids.length === c) {
      centroids.push([...data[Math.floor(Math.random() * n)]])
    }
  }
  
  return centroids
}

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

// === Silhouette Score ===

export function silhouetteScore(data: number[][], labels: number[]): number {
  const n = data.length
  const k = Math.max(...labels) + 1
  
  if (k < 2) return 0
  
  const scores: number[] = []
  
  for (let i = 0; i < n; i++) {
    const cluster = labels[i]
    const sameCluster = data.filter((_, j) => labels[j] === cluster && j !== i)
    
    // a(i) = mean intra-cluster distance
    const a = sameCluster.length > 0 
      ? sameCluster.reduce((sum, p) => sum + euclideanDistance(data[i], p), 0) / sameCluster.length
      : 0
    
    // b(i) = min mean distance to other clusters
    let b = Infinity
    for (let c = 0; c < k; c++) {
      if (c === cluster) continue
      const otherCluster = data.filter((_, j) => labels[j] === c)
      if (otherCluster.length === 0) continue
      const meanDist = otherCluster.reduce((sum, p) => sum + euclideanDistance(data[i], p), 0) / otherCluster.length
      b = Math.min(b, meanDist)
    }
    
    if (b === Infinity) b = 0
    
    const s = Math.max(a, b) === 0 ? 0 : (b - a) / Math.max(a, b)
    scores.push(s)
  }
  
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

// === Main Pipeline ===

export function runClusteringPipeline(
  data: Record<string, unknown>[],
  selectedFeatures: string[],
  numClusters: number,
  onProgress?: (stage: string, progress: number) => void
): Omit<ClusteringOutput, 'clusters'> & { rawClusters: { id: number; size: number; centroid: number[]; avgDistance: number }[] } {
  
  onProgress?.('scaling', 20)
  
  // Extract numeric features
  const numericData: number[][] = data.map(row => 
    selectedFeatures.map(f => {
      const val = row[f]
      return typeof val === 'number' ? val : 0
    })
  )
  
  // Scale
  const { scaled } = standardScale(numericData)
  
  onProgress?.('pca', 40)
  
  // PCA for visualization and dimensionality reduction
  const numPcaComponents = Math.min(2, selectedFeatures.length)
  const { transformed, varianceExplained, loadings } = pca(scaled, numPcaComponents)
  
  onProgress?.('clustering', 60)
  
  // K-Means on original scaled data (not PCA-reduced) for better clustering
  const { labels, centroids, inertia } = kMeans(scaled, numClusters)
  
  onProgress?.('analyzing', 80)
  
  // Calculate silhouette score
  const silhouette = silhouetteScore(scaled, labels)
  
  // Calculate feature importance based on variance within clusters
  const featureImportance = calculateFeatureImportance(scaled, labels, selectedFeatures, loadings)
  
  // Build raw cluster info
  const rawClusters = Array.from({ length: numClusters }, (_, id) => {
    const clusterIndices = labels.map((l, i) => l === id ? i : -1).filter(i => i >= 0)
    const size = clusterIndices.length
    
    // Calculate average distance to centroid
    const avgDistance = size > 0
      ? clusterIndices.reduce((sum, i) => sum + euclideanDistance(scaled[i], centroids[id]), 0) / size
      : 0
    
    return {
      id,
      size,
      centroid: centroids[id],
      avgDistance
    }
  })
  
  onProgress?.('complete', 100)
  
  return {
    rawClusters,
    labels,
    silhouetteScore: silhouette,
    inertia,
    featureImportance,
    pcaVarianceExplained: varianceExplained
  }
}

function calculateFeatureImportance(
  data: number[][], 
  labels: number[], 
  featureNames: string[],
  loadings: number[][]
): { feature: string; importance: number }[] {
  const k = Math.max(...labels) + 1
  const numFeatures = featureNames.length
  
  // Calculate between-cluster variance for each feature
  const importance: number[] = []
  
  for (let f = 0; f < numFeatures; f++) {
    const globalMean = data.reduce((sum, row) => sum + row[f], 0) / data.length
    let betweenVar = 0
    
    for (let c = 0; c < k; c++) {
      const clusterData = data.filter((_, i) => labels[i] === c)
      if (clusterData.length === 0) continue
      const clusterMean = clusterData.reduce((sum, row) => sum + row[f], 0) / clusterData.length
      betweenVar += clusterData.length * Math.pow(clusterMean - globalMean, 2)
    }
    
    importance.push(betweenVar)
  }
  
  // Normalize
  const maxImp = Math.max(...importance) || 1
  
  return featureNames.map((feature, i) => ({
    feature,
    importance: importance[i] / maxImp
  })).sort((a, b) => b.importance - a.importance)
}
