import { useCallback, useEffect, useRef, useState } from "react"
import { listen } from "@tauri-apps/api/event"
import { toast } from "sonner"
import { fsGateway } from "@/features/filesystem/infra/fs.gateway"
import { playArchiveDone } from "@/shared/lib/sounds"

export interface ArchiveOperation {
  id: string
  operation: "compress" | "decompress"
  current: number
  total: number // -1 = indeterminate
  label: string
  startedAt: number
  etaMs: number | null
  done: boolean
  outputName: string | null
}

interface ArchiveProgressEvent {
  id: string
  operation: "compress" | "decompress"
  current: number
  total: number
  label: string
  done: boolean
  output: string | null
  cancelled: boolean
}

export function useArchiveOperations() {
  const [operations, setOperations] = useState<Map<string, ArchiveOperation>>(
    new Map()
  )
  // Keep a ref so the event handler always sees the latest map without
  // needing to be re-registered.
  const operationsRef = useRef<Map<string, ArchiveOperation>>(operations)
  operationsRef.current = operations

  useEffect(() => {
    const unlistenPromise = listen<ArchiveProgressEvent>(
      "archive://progress",
      ({ payload }) => {
        const { id, operation, current, total, label, done, output, cancelled } =
          payload

        if (done) {
          if (cancelled) {
            setOperations((prev) => {
              const next = new Map(prev)
              next.delete(id)
              return next
            })
            return
          }

          if (output != null) {
            const outputName = output.split("/").pop() ?? output
            playArchiveDone()
            setOperations((prev) => {
              const next = new Map(prev)
              const existing = next.get(id)
              next.set(id, {
                ...(existing ?? { id, operation, current: 1, total: 1, label, startedAt: Date.now(), etaMs: null }),
                done: true,
                outputName,
              })
              return next
            })
            setTimeout(() => {
              setOperations((prev) => {
                const next = new Map(prev)
                next.delete(id)
                return next
              })
            }, 3500)
          } else {
            setOperations((prev) => {
              const next = new Map(prev)
              next.delete(id)
              return next
            })
            toast.error(label)
          }
          return
        }

        // Progress event — upsert
        setOperations((prev) => {
          const next = new Map(prev)
          const existing = next.get(id)

          if (!existing) {
            // First event for this id
            next.set(id, {
              id,
              operation,
              current,
              total,
              label,
              startedAt: Date.now(),
              etaMs: null,
              done: false,
              outputName: null,
            })
          } else {
            // Subsequent event — update progress and recompute ETA
            const elapsed = Date.now() - existing.startedAt
            let etaMs: number | null = null
            if (total > 0 && current > 0) {
              const rate = elapsed / current // ms per item
              etaMs = rate * (total - current)
            }
            next.set(id, {
              ...existing,
              current,
              total,
              label,
              etaMs,
            })
          }

          return next
        })
      }
    )

    return () => {
      unlistenPromise.then((unlisten) => unlisten())
    }
  }, [])

  const cancel = useCallback((id: string) => {
    // Remove from local state immediately so the UI collapses at once
    setOperations((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    fsGateway.cancelArchive(id).catch(() => {
      // Best-effort — ignore errors
    })
  }, [])

  return {
    operations: Array.from(operations.values()),
    cancel,
  }
}
