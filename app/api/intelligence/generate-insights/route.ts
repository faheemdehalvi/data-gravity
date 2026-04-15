// Direct OpenAI API route for generating cluster insights - no AI SDK dependencies
import type { ClusterResult } from '@/lib/types'

interface RawCluster {
  id: number
  size: number
  centroid: number[]
  avgDistance: number
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'No OpenAI API key provided. Add your key in the Intelligence panel.' }, { status: 401 })
    }

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
    
    // Call OpenAI API directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a customer intelligence expert interpreting K-Means clustering results.
Your task is to give each cluster a meaningful business name and actionable insights.

CRITICAL RULES:
1. Create distinct, memorable segment names (e.g., "High-Value Loyalists", "At-Risk Champions")
2. Base descriptions on centroid values - high = above average on that feature
3. Consider feature importance when describing segments
4. Recommend specific, actionable business strategies
5. Respond ONLY with valid JSON in this exact format:
{
  "clusters": [
    {
      "id": 0,
      "name": "Segment Name",
      "businessDescription": "2-3 sentence description",
      "characteristics": ["trait1", "trait2", "trait3"],
      "recommendedActions": ["action1", "action2", "action3"]
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Interpret these customer clusters and provide business insights.

Clustering Quality: Silhouette Score = ${silhouetteScore.toFixed(3)} (${silhouetteScore > 0.5 ? 'Good' : silhouetteScore > 0.25 ? 'Fair' : 'Weak'} separation)

Most Important Features:
${featureImportance.slice(0, 5).map(f => `- ${f.feature}: ${(f.importance * 100).toFixed(0)}% importance`).join('\n')}

Cluster Details (centroid values are standardized):
${JSON.stringify(clusterContexts, null, 2)}

Provide a name, description, characteristics, and recommended actions for each cluster.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API error')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || '{}'
    
    // Parse the JSON response
    let output
    try {
      output = JSON.parse(content)
    } catch {
      // If JSON parsing fails, create default insights
      output = {
        clusters: rawClusters.map(c => ({
          id: c.id,
          name: `Segment ${c.id + 1}`,
          businessDescription: `A segment of ${c.size} customers`,
          characteristics: ['Customer segment identified'],
          recommendedActions: ['Analyze further']
        }))
      }
    }
    
    // Merge LLM interpretations with raw cluster data
    const clusters: ClusterResult[] = rawClusters.map(raw => {
      const interpretation = output?.clusters?.find((c: { id: number }) => c.id === raw.id)
      
      return {
        id: raw.id,
        name: interpretation?.name ?? `Segment ${raw.id + 1}`,
        size: raw.size,
        centroid: raw.centroid,
        characteristics: interpretation?.characteristics ?? ['Customer segment identified'],
        businessDescription: interpretation?.businessDescription ?? `A segment of ${raw.size} customers with distinct behavioral patterns.`,
        recommendedActions: interpretation?.recommendedActions ?? ['Analyze segment', 'Develop campaigns'],
        metrics: {
          avgDistance: raw.avgDistance,
          cohesion: 1 / (1 + raw.avgDistance)
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
