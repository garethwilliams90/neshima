"use client"

import { useEffect } from "react"
import { motion, useMotionValue } from "motion/react"
import type { GuideSlot } from "@/components/breathing/breathing-session"
import type { BreathFrame } from "@/lib/breathing"

const MIN_RADIUS = 14
const MAX_RADIUS = 34

export function FourSevenEightGuide({ running, sampleRef }: GuideSlot) {
  const radius = useMotionValue(MIN_RADIUS)

  useEffect(() => {
    sampleRef.current = (frame) => {
      radius.set(markerRadius(frame))
    }

    return () => {
      sampleRef.current = null
    }
  }, [sampleRef, radius])

  useEffect(() => {
    if (running) return
    radius.set(MIN_RADIUS)
  }, [running, radius])

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="aspect-square w-full max-w-[280px]"
    >
      <circle
        cx="50"
        cy="50"
        r={MAX_RADIUS}
        fill="none"
        className="stroke-muted-foreground/35"
        strokeWidth="1.25"
      />
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        className="fill-foreground/10 stroke-foreground"
        strokeWidth="2"
      />
    </svg>
  )
}

function markerRadius(frame: BreathFrame) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (reduce) {
    return frame.phase.id === "exhale" ? MIN_RADIUS : MAX_RADIUS
  }

  if (frame.phase.id === "inhale") {
    return MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * frame.phaseProgress
  }

  if (frame.phase.id === "hold") return MAX_RADIUS

  return MAX_RADIUS - (MAX_RADIUS - MIN_RADIUS) * frame.phaseProgress
}
