"use client"

import { useMemo } from "react"
import { BreathingSession } from "@/components/breathing/breathing-session"
import { IntegerSlider } from "@/components/breathing/integer-slider"
import { BoxGuide } from "@/components/box-breathing/box-guide"
import { usePractice } from "@/components/practice-provider"
import { BOX_CYCLES, BREATHE_LENGTH, boxPhases } from "@/lib/box-breathing"

export function BoxBreathing() {
  const { box, setBoxBreatheLength, setBoxCycles } = usePractice()
  const phases = useMemo(
    () => boxPhases(box.breatheLengthSeconds),
    [box.breatheLengthSeconds],
  )

  return (
    <BreathingSession
      title="Box breathing"
      description="Inhale, hold, exhale, and hold, each for the same length of time."
      instructions="Breathe length sets every side of the box. Cycles repeat the four sides."
      phases={phases}
      cycles={box.cycles}
      summaryRows={(snapshot) => [
        { label: "Cycles", value: String(snapshot.cycles) },
        {
          label: "Breathe length",
          value: `${snapshot.phases[0]?.seconds ?? box.breatheLengthSeconds} seconds`,
        },
      ]}
      controls={
        <>
          <IntegerSlider
            id="box-breathe-length"
            label="Breathe length"
            valueLabel={`${box.breatheLengthSeconds} seconds`}
            min={BREATHE_LENGTH.min}
            max={BREATHE_LENGTH.max}
            value={box.breatheLengthSeconds}
            onChange={setBoxBreatheLength}
          />
          <IntegerSlider
            id="box-cycles"
            label="Cycles"
            valueLabel={`${box.cycles} ${box.cycles === 1 ? "cycle" : "cycles"}`}
            min={BOX_CYCLES.min}
            max={BOX_CYCLES.max}
            value={box.cycles}
            onChange={setBoxCycles}
          />
        </>
      }
      renderGuide={(slot) => <BoxGuide {...slot} />}
    />
  )
}
