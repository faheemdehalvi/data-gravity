import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { ClusterResult } from '@/lib/types'

const clusterInterpretationSchema = z.object({
  clusters: z.array(z.object({
    id: z.number(),
    name: z.string().describe('Creative, business-friendly name for this customer segment'),
    businessDescription: z.string().describe('2-3 sentence description of who these customers are'),
    characteristics: z.array(z.string()).describe('3-5 key traits that define this segment'),
    recommendedActions: z.array(z.string()).describe('3-4 specific marketing/business actions'),
  }))
})

interface RawCluster {
  id: number
  size: number
  centroid: number[]
  avgDistance: number
}

export async function POST(req: Request) {
  try {
    const { 
      rawClusters, 
      featureNames,
      featureImportance,
      silhouetteScore,
      totalCustomers 
    } = await req.json() as {
      rawClusters: RawCluster[]
      featureNames: string[]
      featureImportance: { feature: string; importance: number }[]
      silhouetteScore: number
      totalCustomers: number
    }
    
    // Build context about each cluster's centroid values
    const clusterContexts = rawClusters.map(cluster => ({
      id: cluster.id,
      size: cluster.size,
      percentageOfTotal: ((cluster.size / totalCustomers) * 100).toFixed(1),
      centroidValues: Object.fromEntries(
        featureNames.map((name, i) => [name, cluster.centroid[i]?.toFixed(2) ?? 0])
      ),
      cohesion: cluster.avgDistance.toFixed(3)
    }))
    
    const { output } = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({
        schema: clusterInterpretationSchema,
      }),
      messages: [
        {
          role: 'system',
          content: `You are a customer intelligence expert interpreting K-Means clustering results.
Your task is to give each cluster a meaningful business name and actionable insights.

RULES:
1. Create distinct, memorable segment names (e.g., "High-Value Loyalists", "At-Risk Champions", "Price-Sensitive Browsers")
2. Base descriptions on the centroid values - high values mean the segment scores above average on that feature
3. Consider feature importance when describing what defines each segment
4. Recommend specific, actionable business strategies for each segment
5. Be concise but insightful - focus on business value`
        },
        {
          role: 'user',
          content: `Interpret these customer clusters and provide business insights.

Clustering Quality: Silhouette Score = ${silhouetteScore.toFixed(3)} (${silhouetteScore > 0.5 ? 'Good' : silhouetteScore > 0.25 ? 'Fair' : 'Weak'} separation)

Most Important Features (ranked by how much they differentiate clusters):
${featureImportance.slice(0, 5).map(f => `- ${f.feature}: ${(f.importance * 100).toFixed(0)}% importance`).join('\n')}

Cluster Details (centroid values are standardized, 0 = average, positive = above average, negative = below):
${JSON.stringify(clusterContexts, null, 2)}

Provide a name, description, characteristics, and recommended actions for each cluster.`
        }
      ]
    })
    
    // Merge LLM interpretations with raw cluster data
    const clusters: ClusterResult[] = rawClusters.map(raw => {
      const interpretation = output?.clusters?.find(c => c.id === raw.id)
      
      return {
        id: raw.id,
        name: interpretation?.name ?? `Segment ${raw.id + 1}`,
        size: raw.size,
        centroid: raw.centroid,
        characteristics: interpretation?.characteristics ?? ['Customer segment identified by clustering'],
        businessDescription: interpretation?.businessDescription ?? `A segment of ${raw.size} customers with distinct behavioral patterns.`,
        recommendedActions: interpretation?.recommendedActions ?? ['Analyze segment further', 'Develop targeted campaigns'],
        metrics: {
          avgDistance: raw.avgDistance,
          cohesion: 1 / (1 + raw.avgDistance) // Convert distance to cohesion score
        }
      }
    })
    
    return Response.json({ clusters })
    
  } catch (error) {
    console.error('[v0] Generate insights error:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate insights' 
    }, { status: 500 })
  }
}
