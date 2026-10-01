export type BreathPhase = {
  id: string
  label: string
  seconds: number
}

export type BreathFrame = {
  done: false
  phase: BreathPhase
  phaseIndex: number
  cycleNumber: number
  phaseProgress: number
  secondsRemaining: number
}

export function clampInteger(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

export function cycleDurationSeconds(phases: readonly BreathPhase[]) {
  return phases.reduce((total, phase) => total + phase.seconds, 0)
}

export function sessionDurationSeconds(
  phases: readonly BreathPhase[],
  cycles: number,
) {
  return cycleDurationSeconds(phases) * cycles
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

export function experienceLabel(points: number) {
  return `${points} ${points === 1 ? "point" : "points"}`
}

/**
 * Map elapsed monotonic time onto a repeated phase list.
 * Phase boundaries come from the elapsed timestamp, not from counting frames.
 * Phases may have different lengths.
 */
export function frameAt(
  elapsedMs: number,
  phases: readonly BreathPhase[],
  cycles: number,
): BreathFrame | { done: true } {
  const cycleMs = cycleDurationSeconds(phases) * 1000
  const totalMs = cycleMs * cycles
  const elapsed = Math.max(0, elapsedMs)

  if (cycleMs <= 0 || elapsed >= totalMs) {
    return { done: true }
  }

  const cycleElapsed = elapsed % cycleMs
  let cursor = 0

  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
    const phase = phases[phaseIndex]
    const phaseMs = phase.seconds * 1000

    if (cycleElapsed < cursor + phaseMs || phaseIndex === phases.length - 1) {
      const phaseElapsed = cycleElapsed - cursor
      const remainingMs = phaseMs - phaseElapsed

      return {
        done: false,
        phase,
        phaseIndex,
        cycleNumber: Math.floor(elapsed / cycleMs) + 1,
        phaseProgress: phaseMs === 0 ? 1 : phaseElapsed / phaseMs,
        secondsRemaining: Math.max(1, Math.ceil(remainingMs / 1000)),
      }
    }

    cursor += phaseMs
  }

  return { done: true }
}

export function openingFrame(
  phases: readonly BreathPhase[],
  cycles: number,
): BreathFrame {
  const frame = frameAt(0, phases, cycles)

  if (frame.done) {
    throw new Error("A breathing session cannot already be finished at the start.")
  }

  return frame
}
