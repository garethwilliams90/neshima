"use client"

import { BreathingSession } from "@/components/breathing/breathing-session"
import { IntegerSlider } from "@/components/breathing/integer-slider"
import { FourSevenEightGuide } from "@/components/four-seven-eight/four-seven-eight-guide"
import { usePractice } from "@/components/practice-provider"
import {
  FOUR_SEVEN_EIGHT_CYCLES,
  FOUR_SEVEN_EIGHT_PHASES,
} from "@/lib/four-seven-eight"

export function FourSevenEight() {
  const { fourSevenEightCycles, setFourSevenEightCycles } = usePractice()

  return (
    <BreathingSession
      title="4-7-8"
      description="Inhale through your nose, hold, then exhale through your mouth."
      instructions="The 4, 7, and 8 are fixed. Choose how many times to repeat them."
      phases={FOUR_SEVEN_EIGHT_PHASES}
      cycles={fourSevenEightCycles}
      summaryRows={(snapshot) => [
        { label: "Cycles", value: String(snapshot.cycles) },
        { label: "Pattern", value: "4, 7, 8 seconds" },
      ]}
      controls={
        <IntegerSlider
          id="four-seven-eight-cycles"
          label="Cycles"
          valueLabel={`${fourSevenEightCycles} ${fourSevenEightCycles === 1 ? "cycle" : "cycles"}`}
          min={FOUR_SEVEN_EIGHT_CYCLES.min}
          max={FOUR_SEVEN_EIGHT_CYCLES.max}
          value={fourSevenEightCycles}
          onChange={setFourSevenEightCycles}
        />
      }
      renderGuide={(slot) => <FourSevenEightGuide {...slot} />}
    />
  )
}
