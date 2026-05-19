'use client'

import { AlertTriangle, MapPin, Users } from 'lucide-react'

export function ActiveCrisisCard() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="h-1 bg-destructive" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Active Crisis</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Urban Flooding Detected</h2>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Sector I-9, Islamabad</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>~12,400 affected</span>
              </div>
            </div>
          </div>
          <div className="px-2.5 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
            Severity: High
          </div>
        </div>
      </div>
    </div>
  )
}
