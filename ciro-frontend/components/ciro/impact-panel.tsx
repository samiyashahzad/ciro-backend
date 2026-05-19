'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TrendingUp, Clock, Car, X } from 'lucide-react'

interface ImpactPanelProps {
  onClose: () => void
  onRunAgain: () => void
}

function CountUp({ target, duration = 800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return <span>{count}</span>
}

export function ImpactPanel({ onClose, onRunAgain }: ImpactPanelProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`transition-all duration-350 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'}`}>
      <div className="rounded-xl border-2 border-green-500/30 bg-card overflow-hidden shadow-lg shadow-green-500/10">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-500">System Impact Verified</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Main stat */}
        <div className="px-4 py-6 text-center">
          <div className="text-5xl font-mono font-bold text-green-500 mb-2">
            +<CountUp target={647} />%
          </div>
          <p className="text-sm text-muted-foreground">Response Efficiency Improvement</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-px bg-border">
          <div className="bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Car className="w-4 h-4" />
              <span className="text-xs">Traffic Flow</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-semibold text-foreground">
                <CountUp target={28} duration={600} />
              </span>
              <span className="text-sm text-muted-foreground">km/h</span>
            </div>
            <p className="text-xs text-green-500 mt-0.5">7× faster than crisis baseline</p>
          </div>
          <div className="bg-card px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Response Time</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-semibold text-foreground">
                <CountUp target={8} duration={600} />
              </span>
              <span className="text-sm text-muted-foreground">min</span>
            </div>
            <p className="text-xs text-green-500 mt-0.5">Down from 25 min average</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={onRunAgain}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Run Again
          </Button>
        </div>
      </div>
    </div>
  )
}
