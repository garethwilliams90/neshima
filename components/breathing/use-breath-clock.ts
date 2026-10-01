"use client"

import { useEffect, type RefObject } from "react"
import { frameAt, type BreathFrame, type BreathPhase } from "@/lib/breathing"

export function useBreathClock({
  running,
  phases,
  cycles,
  onFrame,
  onComplete,
  onSample,
}: {
  running: boolean
  phases: readonly BreathPhase[]
  cycles: number
  onFrame: (frame: BreathFrame) => void
  onComplete: () => void
  onSample: RefObject<((frame: BreathFrame) => void) | null>
}) {
  useEffect(() => {
    if (!running) return

    const start = performance.now()
    let frameId = 0
    let lastKey = ""
    let finished = false

    const tick = (now: number) => {
      if (finished) return

      const frame = frameAt(now - start, phases, cycles)

      if (frame.done) {
        finished = true
        onComplete()
        return
      }

      onSample.current?.(frame)

      const key = `${frame.cycleNumber}:${frame.phaseIndex}:${frame.secondsRemaining}`
      if (key !== lastKey) {
        lastKey = key
        onFrame(frame)
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      finished = true
      cancelAnimationFrame(frameId)
    }
  }, [running, phases, cycles, onFrame, onComplete, onSample])
}
