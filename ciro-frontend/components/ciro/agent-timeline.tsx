'use client'

import { type Agent } from '@/lib/ciro/agents'
import { type AgentState } from '@/lib/ciro/use-agent-run'
import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentTimelineProps {
  agents: Agent[]
  agentStates: AgentState[]
  currentIndex: number
}

export function AgentTimeline({ agents, agentStates, currentIndex }: AgentTimelineProps) {
  return (
    <div className="space-y-1">
      {agents.map((agent, index) => {
        const state = agentStates[index]
        const isActive = index === currentIndex
        const isDone = state === 'done'
        const isPending = state === 'pending'

        return (
          <div
            key={agent.id}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300",
              isActive && "bg-card border border-primary/30",
              isDone && "opacity-60",
              isPending && "opacity-40"
            )}
          >
            {/* State indicator */}
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs",
              isDone && "bg-green-500/20 text-green-500",
              isActive && "bg-primary/20 text-primary",
              isPending && "bg-muted text-muted-foreground"
            )}>
              {isDone ? (
                <Check className="w-3 h-3" />
              ) : isActive ? (
                <Circle className="w-2 h-2 fill-current" />
              ) : (
                <Circle className="w-2 h-2" />
              )}
            </div>

            {/* Icon */}
            <span className="text-sm flex-shrink-0">{agent.icon}</span>

            {/* Name */}
            <span className={cn(
              "text-sm flex-1 truncate",
              isActive && "font-medium text-foreground",
              isDone && "text-muted-foreground",
              isPending && "text-muted-foreground"
            )}>
              {agent.name}
            </span>

            {/* Status text for done agents */}
            {isDone && (
              <span className="text-xs text-green-500 flex-shrink-0">Done</span>
            )}
            {isActive && (
              <span className="text-xs text-primary flex-shrink-0 flex items-center gap-1">
                <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                Active
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
