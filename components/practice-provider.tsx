"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  BOX_CYCLES,
  BREATHE_LENGTH,
  type BoxSettings,
  clampBoxCycles,
  clampBreatheLength,
} from "@/lib/box-breathing"
import {
  FOUR_SEVEN_EIGHT_CYCLES,
  clampFourSevenEightCycles,
} from "@/lib/four-seven-eight"

type PracticeContextValue = {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarDocked: boolean
  sessionRunning: boolean
  setSessionRunning: (running: boolean) => void
  box: BoxSettings
  setBoxBreatheLength: (seconds: number) => void
  setBoxCycles: (cycles: number) => void
  fourSevenEightCycles: number
  setFourSevenEightCycles: (cycles: number) => void
}

const PracticeContext = createContext<PracticeContextValue | null>(null)

const wideScreenQuery = "(min-width: 640px)"

function subscribeToWideScreen(onStoreChange: () => void) {
  const media = window.matchMedia(wideScreenQuery)
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function readWideScreen() {
  return window.matchMedia(wideScreenQuery).matches
}

function useWideScreen() {
  return useSyncExternalStore(subscribeToWideScreen, readWideScreen, () => true)
}

export function PracticeProvider({ children }: { children: ReactNode }) {
  const wideScreen = useWideScreen()
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null)
  const sidebarOpen = sidebarOverride ?? wideScreen
  const [sessionRunning, setSessionRunning] = useState(false)
  const [box, setBox] = useState<BoxSettings>({
    breatheLengthSeconds: BREATHE_LENGTH.default,
    cycles: BOX_CYCLES.default,
  })
  const [fourSevenEightCycles, setFourSevenEightCyclesState] = useState<number>(
    FOUR_SEVEN_EIGHT_CYCLES.default,
  )

  const setBoxBreatheLength = useCallback((seconds: number) => {
    setBox((current) => ({
      ...current,
      breatheLengthSeconds: clampBreatheLength(seconds),
    }))
  }, [])

  const setBoxCycles = useCallback((cycles: number) => {
    setBox((current) => ({ ...current, cycles: clampBoxCycles(cycles) }))
  }, [])

  const setFourSevenEightCycles = useCallback((cycles: number) => {
    setFourSevenEightCyclesState(clampFourSevenEightCycles(cycles))
  }, [])

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen: setSidebarOverride,
      sidebarDocked: wideScreen,
      sessionRunning,
      setSessionRunning,
      box,
      setBoxBreatheLength,
      setBoxCycles,
      fourSevenEightCycles,
      setFourSevenEightCycles,
    }),
    [
      sidebarOpen,
      wideScreen,
      sessionRunning,
      box,
      setBoxBreatheLength,
      setBoxCycles,
      fourSevenEightCycles,
      setFourSevenEightCycles,
    ],
  )

  return (
    <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>
  )
}

export function usePractice() {
  const value = useContext(PracticeContext)

  if (!value) {
    throw new Error("usePractice must be used within the breathing layout.")
  }

  return value
}
