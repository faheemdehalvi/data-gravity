import { generateText, Output } from 'ai'
import { z } from 'zod'
import type { DatasetAnalysis, FeatureRecommendation } from '@/lib/types'

const featureRecommendationSchema = z.object({
  columns: z.array(z.string()).describe('Exact column names from the dataset to use for clustering'),
  reasoning: z.string().describe('Brief explanation of why these features were selected'),
  confidence: z.number().min(0).max(1).describe('Confidence score between 0 and 1'),
})

export async function POST(req: Request) {
  try {
    const { analysis } = await req.json() as { analysis: DatasetAnalysis }
    
    // Extract only numeric columns - LLM can only recommend from these
    const numericColumns = analysis.columns
      .filter(c => c.type === 'numeric')
      .map(c => ({
        name: c.name,
        min: c.stats?.min,
        max: c.stats?.max,
        mean: c.stats?.mean,
        nullCount: c.nullCount,
        uniqueCount: c.uniqueCount,
      }))
    
    if (numericColumns.length === 0) {
      return Response.json({ 
        error: 'No numeric columns found in dataset. Clustering requires numeric features.' 
      }, { status: 400 })
    }
    
    const { output } = await generateText({
      model: 'openai/gpt-4o-mini',
      output: Output.object({
        schema: featureRecommendationSchema,
      }),
      messages: [
        {
          role: 'system',
          content: `You are a data science expert analyzing customer datasets for segmentation.
Your task is to recommend the BEST features for K-Means clustering to create meaningful customer segments.

CRITICAL RULES:
1. You can ONLY recommend columns from the provided list - never invent or suggest columns that don't exist
2. Prefer features that capture customer behavior, value, and engagement
3. Avoid ID columns, dates as raw numbers, or features with too many nulls
4. Select 3-6 features that together paint a complete picture of customer differences
5. The columns array must contain EXACT column names from the input`
        },
        {
          role: 'user',
          content: `Analyze this dataset and recommend features for customer segmentation clustering.

Dataset has ${analysis.rowCount} rows.

Available NUMERIC columns (you can ONLY select from these):
${JSON.stringify(numericColumns, null, 2)}

Recommend the best combination of features for meaningful customer segmentation.`
        }
      ]
    })
    
    // Validate that recommended columns actually exist
    const validColumns = output?.columns?.filter(col => 
      numericColumns.some(nc => nc.name === col)
    ) ?? []
    
    if (validColumns.length === 0) {
      // Fallback: use all numeric columns
      return Response.json({
        recommendation: {
          columns: numericColumns.slice(0, 6).map(c => c.name),
          reasoning: 'Using available numeric features for clustering analysis.',
          confidence: 0.7
        } satisfies FeatureRecommendation
      })
    }
    
    return Response.json({
      recommendation: {
        columns: validColumns,
        reasoning: output?.reasoning ?? 'Features selected for customer segmentation.',
        confidence: output?.confidence ?? 0.8
      } satisfies FeatureRecommendation
    })
    
  } catch (error) {
    console.error('[v0] Analyze dataset error:', error)
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Failed to analyze dataset' 
    }, { status: 500 })
  }
}
