'use client'

import { useState, useEffect } from 'react'
import { KeyRound, Eye, EyeOff, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'dg_openai_api_key'

export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

interface ApiKeyBannerProps {
  onKeyChange?: (key: string | null) => void
}

export function ApiKeyBanner({ onKeyChange }: ApiKeyBannerProps) {
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setSaved(stored)
      onKeyChange?.(stored)
    } else {
      setEditing(true)
    }
  }, [onKeyChange])

  const handleSave = () => {
    const trimmed = key.trim()
    if (!trimmed.startsWith('sk-')) return
    localStorage.setItem(STORAGE_KEY, trimmed)
    setSaved(trimmed)
    setKey('')
    setEditing(false)
    onKeyChange?.(trimmed)
  }

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSaved(null)
    setKey('')
    setEditing(true)
    onKeyChange?.(null)
  }

  const maskedKey = saved
    ? `${saved.slice(0, 8)}${'•'.repeat(24)}${saved.slice(-4)}`
    : ''

  if (!editing && saved) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-2" />
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-sm text-muted-foreground">OpenAI API key:</span>
          <code className="text-sm font-mono text-foreground truncate">
            {showKey ? saved : maskedKey}
          </code>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => setShowKey(v => !v)}
          aria-label={showKey ? 'Hide key' : 'Reveal key'}
        >
          {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setEditing(true)}
        >
          Change
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
          aria-label="Remove key"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">OpenAI API Key Required</p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Your key is stored only in your browser and sent directly to OpenAI via our API. It is never logged or persisted server-side.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? 'text' : 'password'}
            placeholder="sk-proj-..."
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className={cn(
              "pr-10 font-mono text-sm",
              key && !key.startsWith('sk-') && "border-destructive focus-visible:ring-destructive"
            )}
          />
          <button
            type="button"
            onClick={() => setShowKey(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showKey ? 'Hide' : 'Show'}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button
          onClick={handleSave}
          disabled={!key.trim().startsWith('sk-')}
          size="default"
        >
          Save Key
        </Button>
        {saved && (
          <Button variant="ghost" onClick={() => { setEditing(false); setKey('') }}>
            Cancel
          </Button>
        )}
      </div>
      {key && !key.startsWith('sk-') && (
        <p className="mt-2 text-xs text-destructive">Key must start with &quot;sk-&quot;</p>
      )}
    </div>
  )
}
