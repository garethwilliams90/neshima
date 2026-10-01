"use client"

import type { ReactNode } from "react"
import { ProgramSidebar } from "@/components/program-sidebar"
import { usePractice } from "@/components/practice-provider"

export function ProgramShell({ children }: { children: ReactNode }) {
  const { sidebarOpen, setSidebarOpen, sessionRunning, sidebarDocked } = usePractice()

  return (
    <div className="relative flex min-h-full flex-1">
      {sessionRunning ? null : (
        <ProgramSidebar
          open={sidebarOpen}
          docked={sidebarDocked}
          onOpenChange={setSidebarOpen}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
