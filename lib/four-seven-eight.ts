import { clampInteger, type BreathPhase } from "@/lib/breathing"

export const FOUR_SEVEN_EIGHT_CYCLES = {
  min: 1,
  max: 8,
  default: 4,
} as const

export const FOUR_SEVEN_EIGHT_PHASES: readonly BreathPhase[] = [
  { id: "inhale", label: "Inhale", seconds: 4 },
  { id: "hold", label: "Hold", seconds: 7 },
  { id: "exhale", label: "Exhale", seconds: 8 },
]

export function clampFourSevenEightCycles(value: number) {
  return clampInteger(
    value,
    FOUR_SEVEN_EIGHT_CYCLES.min,
    FOUR_SEVEN_EIGHT_CYCLES.max,
  )
}
