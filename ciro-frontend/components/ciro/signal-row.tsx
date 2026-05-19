'use client'

import { Cloud, Car, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface SignalCardProps {
  icon: React.ReactNode
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  trendLabel?: string
}

function SignalCard({ icon, label, value, trend, trendLabel }: SignalCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-3 flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs truncate">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-lg font-mono font-semibold text-foreground">{value}</span>
        {trend !== 'neutral' && (
          <div className={`flex items-center gap-0.5 text-xs ${trend === 'up' ? 'text-destructive' : 'text-green-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export function SignalRow() {
  return (
    <div className="flex gap-2">
      <SignalCard
        icon={<Cloud className="w-3.5 h-3.5" />}
        label="Weather"
        value="28mm"
        trend="up"
        trendLabel="+12"
      />
      <SignalCard
        icon={<Car className="w-3.5 h-3.5" />}
        label="Traffic"
        value="4 km/h"
        trend="down"
        trendLabel="-85%"
      />
      <SignalCard
        icon={<MessageCircle className="w-3.5 h-3.5" />}
        label="Sentiment"
        value="Alert"
        trend="up"
      />
    </div>
  )
}
