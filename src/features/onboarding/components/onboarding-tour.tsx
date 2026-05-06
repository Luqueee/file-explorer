import { useState } from "react"
import { createPortal } from "react-dom"
import { ONBOARDING_STEPS } from "../domain/steps"

interface Props {
  onDismiss: () => void
}

export function OnboardingTour({ onDismiss }: Props) {
  const [step, setStep] = useState(0)
  const current = ONBOARDING_STEPS[step]
  const isLast = step === ONBOARDING_STEPS.length - 1

  function next() {
    if (isLast) onDismiss()
    else setStep((s) => s + 1)
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tour de bienvenida"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
    >
      <div className="relative flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-border/80 bg-popover p-8 shadow-2xl">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5">
          {ONBOARDING_STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              }`}
              aria-label={`Paso ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-5xl leading-none" role="img" aria-hidden>
            {current.icon}
          </span>
          <h2 className="text-lg font-semibold tracking-tight">{current.title}</h2>
          <p className="text-sm text-muted-foreground">{current.description}</p>
          {current.hint && (
            <kbd className="mt-1 rounded-md border border-border bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
              {current.hint}
            </kbd>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onDismiss}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Saltar tour
          </button>
          <button
            onClick={next}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {isLast ? "Empezar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
