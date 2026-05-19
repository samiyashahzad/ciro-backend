export interface Agent {
  id: string
  name: string
  icon: string
  thinkingMessage: string
  completedMessage: string
  keyword: string
}

export const agents: Agent[] = [
  {
    id: 'social',
    name: 'Social Listener',
    icon: '📡',
    thinkingMessage: 'Scanning citizen reports from social media...',
    completedMessage: 'Detected 47 flood reports in I-9 sector',
    keyword: 'SOCIAL_WATCHER'
  },
  {
    id: 'weather',
    name: 'Weather Intelligence',
    icon: '🌧️',
    thinkingMessage: 'Confirming rainfall and flood risk levels...',
    completedMessage: 'Confirmed: Heavy rainfall, flood risk high',
    keyword: 'WEATHER_AGENT'
  },
  {
    id: 'traffic',
    name: 'Traffic Monitor',
    icon: '🚗',
    thinkingMessage: 'Checking road conditions and congestion...',
    completedMessage: '3 major routes blocked, traffic at 4 km/h',
    keyword: 'TRAFFIC_MONITOR'
  },
  {
    id: 'synthesizer',
    name: 'Situation Synthesizer',
    icon: '🧠',
    thinkingMessage: 'Analyzing all data streams...',
    completedMessage: 'Crisis profile confirmed: Level 3 flood event',
    keyword: 'SITUATION_SYNTHESIZER'
  },
  {
    id: 'severity',
    name: 'Severity Analyst',
    icon: '📊',
    thinkingMessage: 'Estimating impact and duration...',
    completedMessage: '~12,400 residents affected, 4-6 hour duration',
    keyword: 'SEVERITY_ANALYST'
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher',
    icon: '🚨',
    thinkingMessage: 'Coordinating rescue teams...',
    completedMessage: '3 rescue teams deployed to I-9',
    keyword: 'DISPATCHER'
  },
  {
    id: 'resource',
    name: 'Resource Coordinator',
    icon: '🏥',
    thinkingMessage: 'Reserving emergency resources...',
    completedMessage: '45 hospital beds reserved at PIMS',
    keyword: 'RESOURCE_COORDINATOR'
  },
  {
    id: 'alert',
    name: 'Public Alert',
    icon: '📢',
    thinkingMessage: 'Preparing emergency notifications...',
    completedMessage: 'Alerts sent to 12,400 residents',
    keyword: 'PUBLIC_ALERT'
  },
  {
    id: 'route',
    name: 'Route Manager',
    icon: '🗺️',
    thinkingMessage: 'Calculating alternate traffic routes...',
    completedMessage: 'Traffic rerouted via Margalla Road',
    keyword: 'ROUTE_MANAGER'
  },
  {
    id: 'monitor',
    name: 'Response Monitor',
    icon: '✅',
    thinkingMessage: 'Verifying response effectiveness...',
    completedMessage: 'System impact verified: +647% improvement',
    keyword: 'RESPONSE_MONITOR'
  }
]

export function matchAgentByKeyword(message: string): Agent | null {
  for (const agent of agents) {
    if (message.toUpperCase().includes(agent.keyword)) {
      return agent
    }
  }
  return null
}
