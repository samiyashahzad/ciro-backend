'use client'

import { useState, useCallback } from 'react'
import { NavBar } from '@/components/ciro/nav-bar'
import { ActiveCrisisCard } from '@/components/ciro/active-crisis-card'
import { TacticalMap } from '@/components/ciro/tactical-map'
import { SignalRow } from '@/components/ciro/signal-row'
import { ScanButton } from '@/components/ciro/scan-button'
import { ResponseDrawer } from '@/components/ciro/response-drawer'
import { useAgentRun } from '@/lib/ciro/use-agent-run'

export default function CIROPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showReroute, setShowReroute] = useState(false)
  
  const {
    agents,
    agentStates,
    currentIndex,
    currentAgent,
    isRunning,
    isComplete,
    showImpact,
    startRun,
    reset
  } = useAgentRun()

  const handleScan = useCallback(() => {
    setDrawerOpen(true)
    setShowReroute(false)
    startRun()
  }, [startRun])

  const handleRunAgain = useCallback(() => {
    setShowReroute(false)
    reset()
    startRun()
  }, [reset, startRun])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    reset()
  }, [reset])

  // Show reroute on map when impact panel appears
  const handleShowReroute = useCallback(() => {
    if (showImpact && !showReroute) {
      setShowReroute(true)
    }
  }, [showImpact, showReroute])

  // Trigger reroute visualization when impact shows
  if (showImpact && !showReroute) {
    handleShowReroute()
  }

  return (
    <div className="min-h-dvh bg-background relative overflow-hidden">
      {/* Nav Bar */}
      <NavBar />

      {/* Main Content Container - mobile centered */}
      <div className="max-w-[390px] mx-auto relative min-h-dvh pt-[52px]">
        
        {/* Map Section - Top 60% of viewport, always visible */}
        <div className="relative h-[60vh]">
          <TacticalMap showReroute={showReroute && showImpact} />
        </div>

        {/* Control Panel - Bottom 40% */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent">
          <div className="px-4 pb-6 pt-8 space-y-4">
            {/* Active Crisis Card */}
            <ActiveCrisisCard />

            {/* Signal Row */}
            <SignalRow />

            {/* Scan Button */}
            <ScanButton onClick={handleScan} isLoading={drawerOpen && isRunning && !showImpact} />

            {/* Recent Activity Indicator */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Last scan: 2 minutes ago · 3 agents deployed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Response Drawer - Slides up over map */}
      <ResponseDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        agents={agents}
        agentStates={agentStates}
        currentIndex={currentIndex}
        currentAgent={currentAgent}
        isComplete={isComplete}
        showImpact={showImpact}
        onRunAgain={handleRunAgain}
      />
    </div>
  )
}
