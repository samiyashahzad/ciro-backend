'use client'

import { useEffect, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { AgentStage } from './agent-stage'
import { AgentTimeline } from './agent-timeline'
import { ImpactPanel } from './impact-panel'
import { type Agent } from '@/lib/ciro/agents'
import { type AgentState } from '@/lib/ciro/use-agent-run'

interface ResponseDrawerProps {
  isOpen: boolean
  onClose: () => void
  agents: Agent[]
  agentStates: AgentState[]
  currentIndex: number
  currentAgent: Agent | null
  isComplete: boolean
  showImpact: boolean
  onRunAgain: () => void
}

export function ResponseDrawer({
  isOpen,
  onClose,
  agents,
  agentStates,
  currentIndex,
  currentAgent,
  isComplete,
  showImpact,
  onRunAgain
}: ResponseDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const progress = agents.length > 0 ? ((currentIndex + 1) / agents.length) * 100 : 0

  return (
    <>
      {/* Backdrop - subtle so map remains visible */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        style={{ background: 'linear-gradient(to top, rgba(8,9,13,0.8) 0%, rgba(8,9,13,0.3) 50%, transparent 100%)' }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '55vh', minHeight: '400px' }}
      >
        <div className="max-w-[390px] mx-auto h-full bg-slate-950/95 backdrop-blur-xl rounded-t-2xl border-t border-x border-border overflow-hidden flex flex-col">
          {/* Drawer handle */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Live Response</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close drawer"
              >
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Progress */}
            {!showImpact && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Coordinating {agents.length} agents</span>
                  <span className="text-foreground font-medium">
                    Agent {Math.min(currentIndex + 1, agents.length)} of {agents.length}
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showImpact ? (
              <div className="p-4">
                <ImpactPanel onClose={onClose} onRunAgain={onRunAgain} />
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Agent Stage */}
                <AgentStage
                  agent={currentAgent}
                  state={agentStates[currentIndex] || 'pending'}
                  showResult={currentIndex < agents.length - 1 || isComplete}
                />

                {/* Divider */}
                <div className="mx-4 border-t border-border" />

                {/* Agent Timeline */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Agent Pipeline</p>
                  <AgentTimeline
                    agents={agents}
                    agentStates={agentStates}
                    currentIndex={currentIndex}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
