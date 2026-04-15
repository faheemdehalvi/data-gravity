// Direct OpenAI API route for dataset analysis - no AI SDK dependencies
import type { DatasetAnalysis, FeatureRecommendation } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'No OpenAI API key provided. Add your key in the Intelligence panel.' }, { status: 401 })
    }

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
            content: `You are a data science expert analyzing customer datasets for segmentation.
Your task is to recommend the BEST features for K-Means clustering to create meaningful customer segments.

CRITICAL RULES:
1. You can ONLY recommend columns from the provided list - never invent or suggest columns that don't exist
2. Prefer features that capture customer behavior, value, and engagement
3. Avoid ID columns, dates as raw numbers, or features with too many nulls
4. Select 3-6 features that together paint a complete picture of customer differences
5. Respond ONLY with valid JSON in this exact format:
{
  "columns": ["col1", "col2", "col3"],
  "reasoning": "explanation",
  "confidence": 0.85
}`
          },
          {
            role: 'user',
            content: `Analyze this dataset and recommend features for customer segmentation clustering.

Dataset has ${analysis.rowCount} rows.

Available NUMERIC columns (you can ONLY select from these):
${JSON.stringify(numericColumns, null, 2)}

Recommend the best combination of features for meaningful customer segmentation.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
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
      // If JSON parsing fails, extract what we can
      output = { columns: numericColumns.slice(0, 3).map(c => c.name), reasoning: content, confidence: 0.6 }
    }
    
    // Validate that recommended columns actually exist
    const validColumns = output?.columns?.filter((col: string) => 
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
