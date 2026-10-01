"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export function IntegerSlider({
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
