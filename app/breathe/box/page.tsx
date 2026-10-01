import type { Metadata } from "next"
import { BoxBreathing } from "@/components/box-breathing/box-breathing"

export const metadata: Metadata = {
  title: "Box breathing",
  description: "A guided box breathing practice with equal sides.",
}

export default function BoxBreathingPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col self-center px-6">
      <div className="my-auto w-full py-6">
        <BoxBreathing />
      </div>
    </main>
  )
}
