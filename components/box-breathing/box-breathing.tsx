"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { BoxGuide } from "@/components/box-breathing/box-guide"
import {
  BOX_CYCLES,
  BREATHE_LENGTH,
  type BoxFrame,
  type BoxSettings,
  clampBreatheLength,
  clampCycles,
  experienceForBoxSession,
  formatDuration,
  openingFrame,
  sessionDurationSeconds,
} from "@/lib/box-breathing"

type Screen = "setup" | "running" | "complete"

export function BoxBreathing() {
  const [breatheLengthSeconds, setBreatheLengthSeconds] = useState<number>(
    BREATHE_LENGTH.default,
  )
  const [cycles, setCycles] = useState<number>(BOX_CYCLES.default)
  const [screen, setScreen] = useState<Screen>("setup")
  const [active, setActive] = useState<BoxSettings>({
    breatheLengthSeconds: BREATHE_LENGTH.default,
    cycles: BOX_CYCLES.default,
  })
  const [frame, setFrame] = useState<BoxFrame>(() =>
    openingFrame({
      breatheLengthSeconds: BREATHE_LENGTH.default,
      cycles: BOX_CYCLES.default,
    }),
  )
  const phaseHeadingRef = useRef<HTMLHeadingElement>(null)
  const summaryHeadingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (screen === "running") phaseHeadingRef.current?.focus()
    if (screen === "complete") summaryHeadingRef.current?.focus()
  }, [screen])

  const draft: BoxSettings = { breatheLengthSeconds, cycles }
  const sessionSeconds = sessionDurationSeconds(draft)
  const running = screen === "running"

  function start() {
    const settings = { breatheLengthSeconds, cycles }
    setActive(settings)
    setFrame(openingFrame(settings))
    setScreen("running")
  }

  function end() {
    setScreen("setup")
  }

  const finish = useCallback(() => {
    setScreen("complete")
  }, [])

  function practiceAgain() {
    setScreen("setup")
  }

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {screen === "complete" ? (
        <Completion
          headingRef={summaryHeadingRef}
          settings={active}
          onPracticeAgain={practiceAgain}
        />
      ) : (
        <>
          {screen === "setup" ? (
            <header className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">Neshima</p>
              <h1 className="text-3xl font-medium tracking-tight">
                Box breathing
              </h1>
              <p className="text-sm text-muted-foreground">
                Inhale, hold, exhale, and hold, each for the same length of
                time.
              </p>
            </header>
          ) : (
            <PhaseReadout
              headingRef={phaseHeadingRef}
              frame={frame}
              cycles={active.cycles}
            />
          )}

          <BoxGuide
            running={running}
            breatheLengthSeconds={
              running ? active.breatheLengthSeconds : breatheLengthSeconds
            }
            cycles={running ? active.cycles : cycles}
            phaseIndex={running ? frame.phaseIndex : 0}
            onFrame={setFrame}
            onComplete={finish}
          />

          {running ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Cycle {frame.cycleNumber} of {active.cycles}
              </p>
              <Button type="button" variant="outline" onClick={end}>
                End session
              </Button>
            </div>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Session</CardTitle>
                <CardDescription>
                  Breathe length sets every side of the box. Cycles repeat the
                  four sides.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <Control
                  id="breathe-length"
                  label="Breathe length"
                  valueLabel={`${breatheLengthSeconds} seconds`}
                  min={BREATHE_LENGTH.min}
                  max={BREATHE_LENGTH.max}
                  value={breatheLengthSeconds}
                  onChange={(value) =>
                    setBreatheLengthSeconds(clampBreatheLength(value))
                  }
                />
                <Control
                  id="cycles"
                  label="Cycles"
                  valueLabel={`${cycles} ${cycles === 1 ? "cycle" : "cycles"}`}
                  min={BOX_CYCLES.min}
                  max={BOX_CYCLES.max}
                  value={cycles}
                  onChange={(value) => setCycles(clampCycles(value))}
                />
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
  frame: BoxFrame
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
  settings,
  onPracticeAgain,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>
  settings: BoxSettings
  onPracticeAgain: () => void
}) {
  const duration = sessionDurationSeconds(settings)
  const experience = experienceForBoxSession(settings)

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
        <CardDescription>Box breathing</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Cycles</dt>
          <dd className="text-right tabular-nums">{settings.cycles}</dd>
          <dt className="text-muted-foreground">Breathe length</dt>
          <dd className="text-right tabular-nums">
            {settings.breatheLengthSeconds} seconds
          </dd>
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="text-right">{formatDuration(duration)}</dd>
          <dt className="text-muted-foreground">Experience</dt>
          <dd className="text-right tabular-nums">
            {experience} {experience === 1 ? "point" : "points"}
          </dd>
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

function Control({
  id,
  label,
  valueLabel,
  min,
  max,
  value,
  onChange,
}: {
  id: string
  label: string
  valueLabel: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <Label id={`${id}-label`} htmlFor={id}>
          {label}
        </Label>
        <span className="text-sm tabular-nums text-muted-foreground">
          {valueLabel}
        </span>
      </div>
      <Slider
        id={id}
        aria-labelledby={`${id}-label`}
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(next) => {
          const resolved = Array.isArray(next) ? next[0] : next
          onChange(resolved)
        }}
      />
    </div>
  )
}
