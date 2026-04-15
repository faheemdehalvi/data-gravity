'use client'

import { useWorkflow } from '@/lib/workflow-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileSpreadsheet, ArrowRight, RotateCcw, Hash, Type, Calendar } from 'lucide-react'

const TYPE_ICONS = {
  numeric: Hash,
  categorical: Type,
  text: Type,
  date: Calendar,
  boolean: Type,
}

const TYPE_COLORS = {
  numeric: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  categorical: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  text: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  date: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  boolean: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
}

export function DataPreview() {
  const { state, goToStep, reset } = useWorkflow()
  const { analysis, rawData, fileName, fileSize } = state
  
  if (!analysis || !rawData) return null
  
  const numericCount = analysis.columns.filter(c => c.type === 'numeric').length
  
  return (
    <div className="space-y-6">
      {/* File info */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base text-foreground">{fileName}</CardTitle>
                <CardDescription>
                  {(fileSize! / 1024).toFixed(1)} KB
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Upload Different File
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{analysis.rowCount.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Rows</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{analysis.columnCount}</p>
            <p className="text-sm text-muted-foreground">Columns</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-primary">{numericCount}</p>
            <p className="text-sm text-muted-foreground">Numeric Features</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-foreground">{analysis.columnCount - numericCount}</p>
            <p className="text-sm text-muted-foreground">Categorical</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Column details */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Column Analysis</CardTitle>
          <CardDescription>Detected data types and statistics for each column</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Column</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Unique</TableHead>
                  <TableHead className="text-muted-foreground">Nulls</TableHead>
                  <TableHead className="text-muted-foreground">Stats / Sample</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.columns.map((col) => {
                  const Icon = TYPE_ICONS[col.type]
                  return (
                    <TableRow key={col.name} className="border-border">
                      <TableCell className="font-medium text-foreground">{col.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={TYPE_COLORS[col.type]}>
                          <Icon className="mr-1 h-3 w-3" />
                          {col.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{col.uniqueCount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{col.nullCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {col.type === 'numeric' && col.stats ? (
                          <span className="text-xs">
                            min: {col.stats.min?.toFixed(1)} / max: {col.stats.max?.toFixed(1)} / avg: {col.stats.mean?.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs">{col.sample.slice(0, 3).join(', ')}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Data preview */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Data Preview</CardTitle>
          <CardDescription>First 5 rows of your dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {Object.keys(rawData[0]).slice(0, 8).map(key => (
                    <TableHead key={key} className="text-muted-foreground whitespace-nowrap">{key}</TableHead>
                  ))}
                  {Object.keys(rawData[0]).length > 8 && (
                    <TableHead className="text-muted-foreground">...</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawData.slice(0, 5).map((row, i) => (
                  <TableRow key={i} className="border-border">
                    {Object.values(row).slice(0, 8).map((val, j) => (
                      <TableCell key={j} className="text-foreground whitespace-nowrap">
                        {typeof val === 'number' ? val.toLocaleString() : String(val).slice(0, 20)}
                      </TableCell>
                    ))}
                    {Object.keys(row).length > 8 && (
                      <TableCell className="text-muted-foreground">...</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={reset}>
          Start Over
        </Button>
        <Button onClick={() => goToStep('features')} disabled={numericCount === 0}>
          Continue to Feature Selection
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      {numericCount === 0 && (
        <p className="text-center text-sm text-destructive">
          No numeric columns detected. Clustering requires numeric features.
        </p>
      )}
    </div>
  )
}
