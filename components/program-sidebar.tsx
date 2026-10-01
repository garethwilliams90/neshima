"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { PROGRAMS } from "@/lib/programs"

export function ProgramSidebar({
  open,
  docked,
  onOpenChange,
}: {
  open: boolean
  docked: boolean
  onOpenChange: (open: boolean) => void
}) {
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  return (
    <>
      {open && !docked ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40"
          aria-label="Close programs"
          onClick={() => onOpenChange(false)}
        />
      ) : null}
      <aside
        aria-label="Programs"
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-card",
          open && docked && "w-64",
          open && !docked && "absolute inset-y-0 left-0 z-30 w-64",
          !open && "w-12",
        )}
      >
        <div className={cn("flex items-center gap-2 p-2", open && "justify-between")}>
          {open ? <p className="px-2 text-sm font-medium">Neshima</p> : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={open}
            aria-label={open ? "Close programs" : "Open programs"}
            onClick={() => onOpenChange(!open)}
          >
            {open ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>
        {open ? (
          <nav className="flex flex-col gap-1 px-2 pb-4">
            {PROGRAMS.map((program) => {
              const current = pathname === program.href

              return (
                <Link
                  key={program.href}
                  href={program.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    current ? "bg-muted" : "hover:bg-muted/60",
                  )}
                >
                  <span className="block font-medium">{program.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {program.description}
                  </span>
                </Link>
              )
            })}
          </nav>
        ) : null}
      </aside>
    </>
  )
}
