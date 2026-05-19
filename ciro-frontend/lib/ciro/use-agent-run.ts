'use client'

import { useState, useEffect, useCallback } from 'react'
import { agents, matchAgentByKeyword, type Agent } from './agents'

export type AgentState = 'pending' | 'active' | 'done'

export interface AgentRunState {
  currentIndex: number
  agentStates: AgentState[]
  isRunning: boolean
  isComplete: boolean
  showImpact: boolean
}

const FALLBACK_DELAY = 2500 // 2.5s per agent fallback

export function useAgentRun() {
  const [state, setState] = useState<AgentRunState>({
    currentIndex: -1,
    agentStates: agents.map(() => 'pending' as AgentState),
    isRunning: false,
    isComplete: false,
    showImpact: false
  })

  const [ws, setWs] = useState<WebSocket | null>(null)

  const startRun = useCallback(async () => {
    setState({
      currentIndex: 0,
      agentStates: agents.map((_, i) => (i === 0 ? 'active' : 'pending') as AgentState),
      isRunning: true,
      isComplete: false,
      showImpact: false
    })

    // Try to trigger the backend
    try {
      await fetch('https://sofiajeon-ciro-backend.hf.space/api/v1/system/trigger_graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors'
      }).catch(() => {
        // Silently fail - we'll use fallback timing
      })
    } catch {
      // Silently fail
    }

    // Try WebSocket connection
    try {
      const socket = new WebSocket('wss://sofiajeon-ciro-backend.hf.space/ws/trace')
      setWs(socket)

      socket.onmessage = (event) => {
        const agent = matchAgentByKeyword(event.data)
        if (agent) {
          const agentIndex = agents.findIndex(a => a.id === agent.id)
          if (agentIndex !== -1) {
            advanceToAgent(agentIndex)
          }
        }
      }

      socket.onerror = () => {
        socket.close()
      }
    } catch {
      // Silently fail - use fallback timing
    }
  }, [])

  const advanceToAgent = useCallback((targetIndex: number) => {
    setState(prev => {
      if (targetIndex <= prev.currentIndex) return prev

      const newStates = [...prev.agentStates]
      // Mark all agents up to targetIndex as done
      for (let i = 0; i <= targetIndex; i++) {
        if (i < targetIndex) {
          newStates[i] = 'done'
        } else {
          newStates[i] = 'active'
        }
      }

      const isComplete = targetIndex >= agents.length - 1
      
      return {
        ...prev,
        currentIndex: targetIndex,
        agentStates: newStates,
        isComplete
      }
    })
  }, [])

  // Fallback timer to advance agents
  useEffect(() => {
    if (!state.isRunning || state.isComplete) return

    const timer = setTimeout(() => {
      const nextIndex = state.currentIndex + 1
      if (nextIndex < agents.length) {
        advanceToAgent(nextIndex)
      } else {
        // Complete the last agent
        setState(prev => ({
          ...prev,
          agentStates: prev.agentStates.map(() => 'done' as AgentState),
          isComplete: true
        }))
      }
    }, FALLBACK_DELAY)

    return () => clearTimeout(timer)
  }, [state.currentIndex, state.isRunning, state.isComplete, advanceToAgent])

  // Show impact panel after completion
  useEffect(() => {
    if (state.isComplete && !state.showImpact) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, showImpact: true }))
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [state.isComplete, state.showImpact])

  // Cleanup WebSocket
  useEffect(() => {
    return () => {
      ws?.close()
    }
  }, [ws])

  const reset = useCallback(() => {
    ws?.close()
    setWs(null)
    setState({
      currentIndex: -1,
      agentStates: agents.map(() => 'pending' as AgentState),
      isRunning: false,
      isComplete: false,
      showImpact: false
    })
  }, [ws])

  return {
    ...state,
    agents,
    currentAgent: state.currentIndex >= 0 ? agents[state.currentIndex] : null,
    startRun,
    reset
  }
}
