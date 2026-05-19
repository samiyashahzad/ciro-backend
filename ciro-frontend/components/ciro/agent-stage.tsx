'use client'

import { type Agent } from '@/lib/ciro/agents'
import { useTypewriter } from '@/hooks/use-typewriter'
import { type AgentState } from '@/lib/ciro/use-agent-run'
import { Check } from 'lucide-react'

interface AgentStageProps {
  agent: Agent | null
  state: AgentState
  showResult: boolean
}

export function AgentStage({ agent, state, showResult }: AgentStageProps) {
  const message = state === 'done' || showResult ? agent?.completedMessage : agent?.thinkingMessage
  const { displayedText, isComplete } = useTypewriter(message || '', 35, 200)

  if (!agent) return null

  return (
    <div className="flex flex-col items-center text-center px-4 py-6">
      {/* Pulsing icon */}
      <div className="relative mb-4">
        <div className={`absolute inset-0 w-16 h-16 rounded-full ${state === 'active' ? 'bg-primary/20 animate-pulse-ring' : state === 'done' ? 'bg-green-500/20' : 'bg-muted/20'}`} />
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl ${state === 'done' ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border'} border`}>
          {state === 'done' ? (
            <Check className="w-7 h-7 text-green-500" />
          ) : (
            <span>{agent.icon}</span>
          )}
        </div>
      </div>

      {/* Agent name */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{agent.name}</h3>

      {/* Typing status */}
      <p className="text-sm text-muted-foreground min-h-[40px] max-w-[280px]">
        {displayedText}
        {!isComplete && state === 'active' && (
          <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
        )}
      </p>

      {/* Result chip */}
      {(state === 'done' || (showResult && isComplete)) && (
        <div className="mt-3 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Check className="w-3 h-3" />
          <span>Confirmed</span>
        </div>
      )}
    </div>
  )
}
