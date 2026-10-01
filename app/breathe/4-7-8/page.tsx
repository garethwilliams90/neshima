import type { Metadata } from "next"
import { FourSevenEight } from "@/components/four-seven-eight/four-seven-eight"

export const metadata: Metadata = {
  title: "4-7-8",
  description: "A guided 4-7-8 breathing practice. Inhale for 4, hold for 7, exhale for 8.",
}

export default function FourSevenEightPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col self-center px-6">
      <div className="my-auto w-full py-6">
        <FourSevenEight />
      </div>
    </main>
  )
}
