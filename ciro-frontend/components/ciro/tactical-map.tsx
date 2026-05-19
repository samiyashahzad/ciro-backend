'use client'

import { useEffect, useState } from 'react'

interface TacticalMapProps {
  showReroute?: boolean
}

export function TacticalMap({ showReroute = false }: TacticalMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Islamabad I-9 coordinates
  const lat = 33.6844
  const lng = 73.0479

  if (!mounted) {
    return (
      <div className="w-full h-full bg-secondary animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading map...</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* OSM Iframe with grayscale filter */}
      <iframe
        className="absolute inset-0 w-full h-full grayscale brightness-[0.3] contrast-125"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.05}%2C${lat - 0.03}%2C${lng + 0.05}%2C${lat + 0.03}&layer=mapnik`}
        style={{ border: 0 }}
        loading="lazy"
        title="Tactical Map"
      />
      
      {/* Map overlay for interaction blocking */}
      <div className="absolute inset-0 bg-transparent pointer-events-none" />
      
      {/* Pulsing red marker at crisis location */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="absolute inset-0 w-8 h-8 bg-destructive/30 rounded-full animate-pulse-ring" />
          <div className="relative w-8 h-8 bg-destructive rounded-full flex items-center justify-center shadow-lg shadow-destructive/50">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Floating location pill */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="px-3 py-1.5 bg-card/90 backdrop-blur-sm rounded-full border border-border flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          <span className="text-sm font-medium text-foreground">I-9 · Flood Active</span>
        </div>
      </div>

      {/* Reroute path visualization */}
      {showReroute && (
        <>
          {/* Blue reroute indicator */}
          <div className="absolute bottom-16 right-4 z-10">
            <div className="px-3 py-1.5 bg-primary/90 backdrop-blur-sm rounded-full flex items-center gap-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-sm font-medium text-white">Rerouted via Margalla</span>
            </div>
          </div>
          
          {/* Visual route line (simplified SVG overlay) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-[5]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M 20 80 Q 30 60 45 50 Q 55 42 70 35 Q 85 28 90 20"
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              opacity="0.8"
            />
            <circle cx="20" cy="80" r="1.5" fill="rgb(59, 130, 246)" />
            <circle cx="90" cy="20" r="1.5" fill="rgb(34, 197, 94)" />
          </svg>
        </>
      )}
    </div>
  )
}
