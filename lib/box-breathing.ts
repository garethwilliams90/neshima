import {
  clampInteger,
  type BreathPhase,
} from "@/lib/breathing"

export const BREATHE_LENGTH = {
  min: 2,
  max: 10,
  default: 4,
} as const

export const BOX_CYCLES = {
  min: 1,
  max: 20,
  default: 4,
} as const

export const BOX_PHASES = [
  { id: "inhale", label: "Inhale" },
  { id: "hold-after-inhale", label: "Hold" },
  { id: "exhale", label: "Exhale" },
  { id: "hold-after-exhale", label: "Hold" },
] as const

/** Square inset in a 100×100 viewBox, clockwise from the top-left. */
export const BOX_SQUARE = { min: 14, max: 86 } as const

export type BoxSettings = {
  breatheLengthSeconds: number
  cycles: number
}

export function clampBreatheLength(value: number) {
  return clampInteger(value, BREATHE_LENGTH.min, BREATHE_LENGTH.max)
}

export function clampBoxCycles(value: number) {
  return clampInteger(value, BOX_CYCLES.min, BOX_CYCLES.max)
}

export function boxPhases(breatheLengthSeconds: number): BreathPhase[] {
  return BOX_PHASES.map((phase) => ({
    id: phase.id,
    label: phase.label,
    seconds: breatheLengthSeconds,
  }))
}

export function sideLine(phaseIndex: number) {
  const { min, max } = BOX_SQUARE

  switch (phaseIndex % BOX_PHASES.length) {
    case 0:
      return { x1: min, y1: min, x2: max, y2: min }
    case 1:
      return { x1: max, y1: min, x2: max, y2: max }
    case 2:
      return { x1: max, y1: max, x2: min, y2: max }
    default:
      return { x1: min, y1: max, x2: min, y2: min }
  }
}

export function indicatorPoint(phaseIndex: number, progress: number) {
  const line = sideLine(phaseIndex)
  const t = Math.min(1, Math.max(0, progress))

  return {
    x: line.x1 + (line.x2 - line.x1) * t,
    y: line.y1 + (line.y2 - line.y1) * t,
  }
}
