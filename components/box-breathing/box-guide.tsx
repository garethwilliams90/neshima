"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useReducedMotion } from "motion/react"
import {
  BOX_PHASES,
  type BoxFrame,
  frameAt,
  indicatorPoint,
  sideLine,
} from "@/lib/box-breathing"

type BoxGuideProps = {
  running: boolean
  breatheLengthSeconds: number
  cycles: number
  phaseIndex: number
  onFrame: (frame: BoxFrame) => void
  onComplete: () => void
}

export function BoxGuide({
  running,
  breatheLengthSeconds,
  cycles,
  phaseIndex,
  onFrame,
  onComplete,
}: BoxGuideProps) {
  const reduceMotion = useReducedMotion()
  const startPoint = indicatorPoint(0, 0)
  const x = useMotionValue(startPoint.x)
  const y = useMotionValue(startPoint.y)

  useEffect(() => {
    if (!running) {
      const idle = indicatorPoint(0, 0)
      x.set(idle.x)
      y.set(idle.y)
      return
    }

    const start = performance.now()
    let frameId = 0
    let lastKey = ""
    let finished = false
    const settings = { breatheLengthSeconds, cycles }

    const tick = (now: number) => {
      if (finished) return

      const frame = frameAt(now - start, settings)

      if (frame.done) {
        finished = true
        onComplete()
        return
      }

      const progress = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 0.5
        : frame.phaseProgress
      const point = indicatorPoint(frame.phaseIndex, progress)
      x.set(point.x)
      y.set(point.y)

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
  }, [running, breatheLengthSeconds, cycles, onFrame, onComplete, x, y])

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="aspect-square w-full max-w-[280px]"
    >
      {BOX_PHASES.map((phase, index) => {
        const line = sideLine(index)
        const active = running && index === phaseIndex

        return (
          <motion.line
            key={phase.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            strokeLinecap="round"
            className={
              active ? "stroke-foreground" : "stroke-muted-foreground/40"
            }
            initial={false}
            animate={{ strokeWidth: active ? 4 : 1.75 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          />
        )
      })}
      <motion.circle cx={x} cy={y} r={5.5} className="fill-background" />
      <motion.circle cx={x} cy={y} r={3.2} className="fill-foreground" />
    </svg>
  )
}
