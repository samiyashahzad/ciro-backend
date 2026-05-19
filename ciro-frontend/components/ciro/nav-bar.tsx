'use client'

import { Hexagon } from 'lucide-react'

export function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[52px] bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[390px] mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Hexagon className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">CIRO</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
          </span>
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
      </div>
    </header>
  )
}
