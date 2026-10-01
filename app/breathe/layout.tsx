import type { ReactNode } from "react"
import { PracticeProvider } from "@/components/practice-provider"
import { ProgramShell } from "@/components/program-shell"

export default function BreatheLayout({ children }: { children: ReactNode }) {
  return (
    <PracticeProvider>
      <ProgramShell>{children}</ProgramShell>
    </PracticeProvider>
  )
}
