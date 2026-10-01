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

export type BoxPhase = (typeof BOX_PHASES)[number]

/** Square inset in a 100×100 viewBox, clockwise from the top-left. */
export const BOX_SQUARE = { min: 14, max: 86 } as const

export type BoxSettings = {
  breatheLengthSeconds: number
  cycles: number
}

export type BoxFrame = {
  done: false
  phase: BoxPhase
  phaseIndex: number
  cycleNumber: number
  phaseProgress: number
  secondsRemaining: number
}

export function clampBreatheLength(value: number) {
  return clampInteger(value, BREATHE_LENGTH.min, BREATHE_LENGTH.max)
}

export function clampCycles(value: number) {
  return clampInteger(value, BOX_CYCLES.min, BOX_CYCLES.max)
}

export function sessionDurationSeconds(settings: BoxSettings) {
  return settings.cycles * settings.breatheLengthSeconds * BOX_PHASES.length
}

export function experienceForBoxSession(settings: BoxSettings) {
  return sessionDurationSeconds(settings)
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const parts: string[] = []

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`)
  }

  if (seconds > 0 || minutes === 0) {
    parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`)
  }

  return parts.join(" ")
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

/**
 * Map elapsed monotonic time onto the box cycle.
 * Phase boundaries come from the elapsed timestamp, not from counting frames.
 */
export function openingFrame(settings: BoxSettings): BoxFrame {
  const frame = frameAt(0, settings)

  if (frame.done) {
    throw new Error("A box session cannot already be finished at the start.")
  }

  return frame
}

export function frameAt(
  elapsedMs: number,
  settings: BoxSettings,
): BoxFrame | { done: true } {
  const phaseMs = settings.breatheLengthSeconds * 1000
  const totalPhases = settings.cycles * BOX_PHASES.length
  const totalMs = phaseMs * totalPhases
  const elapsed = Math.max(0, elapsedMs)

  if (elapsed >= totalMs) {
    return { done: true }
  }

  const absolutePhase = Math.floor(elapsed / phaseMs)
  const phaseElapsed = elapsed - absolutePhase * phaseMs
  const remainingMs = phaseMs - phaseElapsed
  const phaseIndex = absolutePhase % BOX_PHASES.length

  return {
    done: false,
    phase: BOX_PHASES[phaseIndex],
    phaseIndex,
    cycleNumber: Math.floor(absolutePhase / BOX_PHASES.length) + 1,
    phaseProgress: phaseElapsed / phaseMs,
    secondsRemaining: Math.max(1, Math.ceil(remainingMs / 1000)),
  }
}

function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)))
}
