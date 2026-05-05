import { Archive, CheckCircle2, PackageOpen, X } from "lucide-react"
import { useArchiveOperations } from "../hooks/use-archive-operations"

// ---------------------------------------------------------------------------
// ETA formatter
// ---------------------------------------------------------------------------

function formatEta(ms: number): string {
  if (ms < 5_000) return "terminando..."
  if (ms < 60_000) return `~${Math.round(ms / 1_000)} seg`
  if (ms < 3_600_000) return `~${Math.round(ms / 60_000)} min`
  return `~${Math.round(ms / 3_600_000)} h`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArchiveProgressPanel() {
  const { operations, cancel } = useArchiveOperations()

  if (operations.length === 0) return null

  return (
    <div className="fixed right-4 bottom-10 z-50 flex w-72 flex-col gap-2">
      {operations.map((op) => {
        const isCompress = op.operation === "compress"

        if (op.done) {
          const pastVerb = isCompress ? "Comprimido" : "Descomprimido"
          return (
            <div
              key={op.id}
              className="w-72 rounded-lg border border-border bg-popover p-3 shadow-xl"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{pastVerb}</span>
                </div>
              </div>
              {op.outputName && (
                <p className="mb-2 truncate text-xs text-muted-foreground">
                  {op.outputName}
                </p>
              )}
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-primary" />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Completado</span>
                <span>100%</span>
              </div>
            </div>
          )
        }

        const Icon = isCompress ? Archive : PackageOpen
        const verb = isCompress ? "Comprimiendo" : "Descomprimiendo"
        const percent =
          op.total > 0
            ? Math.min(100, Math.round((op.current / op.total) * 100))
            : 0
        const indeterminate = op.total < 0 || op.current === 0

        return (
          <div
            key={op.id}
            className="w-72 rounded-lg border border-border bg-popover p-3 shadow-xl"
          >
            {/* Header row */}
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{verb}</span>
              </div>
              <button
                onClick={() => cancel(op.id)}
                className="rounded p-0.5 transition-colors hover:bg-muted"
                aria-label="Cancelar"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Label row */}
            {op.label ? (
              <p className="mb-2 truncate text-xs text-muted-foreground">
                {op.label}
              </p>
            ) : (
              <div className="mb-2" />
            )}

            {/* Progress bar */}
            <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              {indeterminate ? (
                <div className="h-full w-full animate-pulse bg-primary/60 opacity-70" />
              ) : (
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${percent}%` }}
                />
              )}
            </div>

            {/* Stats row */}
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>
                {indeterminate
                  ? `${op.current} entradas`
                  : `${op.current} / ${op.total}`}
              </span>
              <span>
                {!indeterminate && op.etaMs != null
                  ? formatEta(op.etaMs)
                  : !indeterminate
                    ? `${percent}%`
                    : null}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
