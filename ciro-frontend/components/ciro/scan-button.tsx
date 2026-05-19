'use client'

import { Button } from '@/components/ui/button'
import { Scan } from 'lucide-react'

interface ScanButtonProps {
  onClick: () => void
  isLoading?: boolean
}

export function ScanButton({ onClick, isLoading }: ScanButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <span>Analyzing</span>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-typing-dot" />
            <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-typing-dot-2" />
            <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-typing-dot-3" />
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Scan className="w-5 h-5" />
          <span>Run Intelligence Scan</span>
        </span>
      )}
    </Button>
  )
}
