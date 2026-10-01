"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { usePractice } from "@/components/practice-provider"
import { useBreathClock } from "@/components/breathing/use-breath-clock"
import {
  experienceLabel,
  formatDuration,
  openingFrame,
  sessionDurationSeconds,
  type BreathFrame,
  type BreathPhase,
} from "@/lib/breathing"

type Screen = "setup" | "running" | "complete"

export type GuideSlot = {
  running: boolean
  phaseIndex: number
  sampleRef: RefObject<((frame: BreathFrame) => void) | null>
}

type SummaryRow = {
  label: string
  value: string
}

export function BreathingSession({
  title,
  description,
  instructions,
  phases,
  cycles,
  controls,
  summaryRows,
  renderGuide,
}: {
  title: string
  description: string
  instructions: string
  phases: readonly BreathPhase[]
  cycles: number
  controls: ReactNode
  summaryRows: (snapshot: {
    phases: readonly BreathPhase[]
    cycles: number
  }) => SummaryRow[]
  renderGuide: (slot: GuideSlot) => ReactNode
}) {
  const { setSessionRunning } = usePractice()
  const [screen, setScreen] = useState<Screen>("setup")
  const [run, setRun] = useState<{
    phases: BreathPhase[]
    cycles: number
  } | null>(null)
  const [frame, setFrame] = useState<BreathFrame>(() => openingFrame(phases, cycles))
  const phaseHeadingRef = useRef<HTMLHeadingElement>(null)
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null)
  const sampleRef = useRef<((frame: BreathFrame) => void) | null>(null)
  const running = screen === "running"
  const activePhases = running && run ? run.phases : phases
  const activeCycles = running && run ? run.cycles : cycles

  const finish = useCallback(() => {
    setSessionRunning(false)
    setScreen("complete")
  }, [setSessionRunning])

  useBreathClock({
    running,
    phases: activePhases,
    cycles: activeCycles,
    onFrame: setFrame,
    onComplete: finish,
    onSample: sampleRef,
  })

  useEffect(() => {
    if (screen === "running") phaseHeadingRef.current?.focus()
    if (screen === "complete") summaryHeadingRef.current?.focus()
  }, [screen])

  useEffect(() => {
    return () => setSessionRunning(false)
  }, [setSessionRunning])

  function start() {
    const snapshot = {
      phases: phases.map((phase) => ({ ...phase })),
      cycles,
    }
    setRun(snapshot)
    setFrame(openingFrame(snapshot.phases, snapshot.cycles))
    setSessionRunning(true)
    setScreen("running")
  }

  function end() {
    setSessionRunning(false)
    setScreen("setup")
  }

  function practiceAgain() {
    setScreen("setup")
  }

  const sessionSeconds = sessionDurationSeconds(phases, cycles)

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {screen === "complete" && run ? (
        <Completion
          headingRef={summaryHeadingRef}
          title={title}
          rows={[
            ...summaryRows(run),
            {
              label: "Duration",
              value: formatDuration(sessionDurationSeconds(run.phases, run.cycles)),
            },
            {
              label: "Experience",
              value: experienceLabel(sessionDurationSeconds(run.phases, run.cycles)),
            },
          ]}
          onPracticeAgain={practiceAgain}
        />
      ) : (
        <>
          {screen === "setup" ? (
            <header className="space-y-2 text-center">
              <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </header>
          ) : (
            <PhaseReadout
              headingRef={phaseHeadingRef}
              frame={frame}
              cycles={activeCycles}
            />
          )}

          {renderGuide({
            running,
            phaseIndex: running ? frame.phaseIndex : 0,
            sampleRef,
          })}

          {running ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Cycle {frame.cycleNumber} of {activeCycles}
              </p>
              <Button type="button" variant="outline" onClick={end}>
                End session
              </Button>
            </div>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Session</CardTitle>
                <CardDescription>{instructions}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {controls}
                <p className="text-sm text-muted-foreground">
                  This session is {formatDuration(sessionSeconds)}.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  size="lg"
                  className="h-11 w-full text-base"
                  onClick={start}
                >
                  Start
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function PhaseReadout({
  headingRef,
  frame,
  cycles,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  frame: BreathFrame
  cycles: number
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="sr-only" aria-live="polite">
        {frame.phase.label}. Cycle {frame.cycleNumber} of {cycles}.
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-5xl font-medium tracking-tight text-foreground outline-none"
      >
        {frame.phase.label}
      </h1>
      <p className="text-6xl font-medium tabular-nums tracking-tight">
        {frame.secondsRemaining}
      </p>
    </div>
  )
}

function Completion({
  headingRef,
  title,
  rows,
  onPracticeAgain,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  title: string
  rows: SummaryRow[]
  onPracticeAgain: () => void
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-medium tracking-tight outline-none"
          >
            Session complete
          </h1>
        </CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-base"
          onClick={onPracticeAgain}
        >
          Practice again
        </Button>
      </CardFooter>
    </Card>
  )
}
