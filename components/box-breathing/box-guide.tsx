"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useReducedMotion } from "motion/react"
import type { GuideSlot } from "@/components/breathing/breathing-session"
import { BOX_PHASES, indicatorPoint, sideLine } from "@/lib/box-breathing"

export function BoxGuide({ running, phaseIndex, sampleRef }: GuideSlot) {
  const reduceMotion = useReducedMotion()
  const startPoint = indicatorPoint(0, 0)
  const x = useMotionValue(startPoint.x)
  const y = useMotionValue(startPoint.y)

  useEffect(() => {
    sampleRef.current = (frame) => {
      const progress = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 0.5
        : frame.phaseProgress
      const point = indicatorPoint(frame.phaseIndex, progress)
      x.set(point.x)
      y.set(point.y)
    }

    return () => {
      sampleRef.current = null
    }
  }, [sampleRef, x, y])

  useEffect(() => {
    if (running) return
    const idle = indicatorPoint(0, 0)
    x.set(idle.x)
    y.set(idle.y)
  }, [running, x, y])

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
