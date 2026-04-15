'use client'

import { useCallback, useState } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useWorkflow } from '@/lib/workflow-context'
import { parseCSV, analyzeDataset } from '@/lib/ml'
import { generateDemoDataset, demoDataToCSV } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function UploadZone() {
  const { setFile, setData, setAnalysis, goToStep, setError, setLoading, state } = useWorkflow()
  const [isDragging, setIsDragging] = useState(false)
  
  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be under 10MB')
      return
    }
    
    setLoading(true)
    setFile(file.name, file.size)
    
    try {
      const text = await file.text()
      const data = parseCSV(text)
      
      if (data.length < 10) {
        setError('Dataset must have at least 10 rows for meaningful clustering')
        return
      }
      
      setData(data)
      
      const analysis = analyzeDataset(data)
      setAnalysis(analysis)
      
      goToStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file')
    } finally {
      setLoading(false)
    }
  }, [setFile, setData, setAnalysis, goToStep, setError, setLoading])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])
  
  const loadDemoData = useCallback(async () => {
    setLoading(true)
    setFile('demo-customers.csv', 0)
    
    try {
      // Generate demo dataset
      const demoCustomers = generateDemoDataset(500)
      const csvText = demoDataToCSV(demoCustomers)
      const data = parseCSV(csvText)
      
      setData(data)
      setFile('demo-customers.csv', csvText.length)
      
      const analysis = analyzeDataset(data)
      setAnalysis(analysis)
      
      goToStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load demo data')
    } finally {
      setLoading(false)
    }
  }, [setFile, setData, setAnalysis, goToStep, setError, setLoading])
  
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50",
            state.isLoading && "pointer-events-none opacity-60"
          )}
        >
          {state.isLoading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg text-muted-foreground">Processing file...</p>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {isDragging ? (
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-primary" />
                )}
              </div>
              
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">
                  {isDragging ? 'Drop your CSV file here' : 'Upload your customer data'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Drag and drop a CSV file, or click to browse
                </p>
              </div>
              
              <label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="sr-only"
                />
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Select File</span>
                </Button>
              </label>
              
              <p className="text-xs text-muted-foreground">
                CSV files up to 10MB. Requires numeric columns for clustering.
              </p>
              
              <div className="flex items-center gap-2 pt-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              <Button 
                variant="secondary" 
                onClick={loadDemoData}
                className="bg-primary/10 hover:bg-primary/20 text-primary"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try with Demo Data
              </Button>
            </>
          )}
        </div>
        
        {state.error && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{state.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
