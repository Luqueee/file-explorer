import { useMemo } from "react"
import { useFileExplorer } from "../state/explorer-context"
import { useMemoryUsage } from "../hooks/use-memory-usage"
import { formatSize } from "@/shared/lib/format"

const MB = 1024 * 1024
const GB = 1024 * MB

function formatBytes(bytes: number) {
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`
  return `${(bytes / MB).toFixed(0)} MB`
}

export function StatusFooter() {
  const {
    path,
    loading,
    error,
    dirCount,
    fileCount,
    totalCount,
    filterQuery,
    clipboard,
    selectedPaths,
    entries,
    hasMore,
    loadMore,
    total,
  } = useFileExplorer()
  const memory = useMemoryUsage()

  // Sum file sizes of selected items (dirs are 0, sin recursión).
  const selectedSize = useMemo(() => {
    if (selectedPaths.size < 2) return 0
    let sum = 0
    for (const e of entries) {
      if (!e.is_dir && selectedPaths.has(e.path)) sum += e.size
    }
    return sum
  }, [selectedPaths, entries])

  return (
    <footer className="flex h-7 w-full shrink-0 items-center gap-3 overflow-hidden border-t border-border/60 bg-muted/20 px-4 text-[11px] text-muted-foreground">
      {/* Left: stats — flex-1 toma espacio disponible */}
      <span className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
        {!loading && !error && (
          <>
            {clipboard && (
              <span className="min-w-0 shrink truncate text-primary">
                {clipboard.op === "copy" ? "Copiado" : "Cortado"}:{" "}
                {clipboard.paths.length === 1
                  ? clipboard.paths[0].split("/").at(-1)
                  : `${clipboard.paths.length} elementos`}
              </span>
            )}
            <span className="shrink-0 whitespace-nowrap">
              {dirCount} {dirCount === 1 ? "carpeta" : "carpetas"} · {fileCount}{" "}
              {fileCount === 1 ? "archivo" : "archivos"}
              {filterQuery && ` (filtrado de ${totalCount})`}
            </span>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="shrink-0 text-primary underline-offset-2 hover:underline disabled:opacity-50"
              >
                +{(total - totalCount).toLocaleString()} más
              </button>
            )}
            {selectedPaths.size > 1 && (
              <span className="shrink-0 whitespace-nowrap text-primary">
                {selectedPaths.size} seleccionados
                {selectedSize > 0 && ` · ${formatSize(selectedSize)}`}
              </span>
            )}
          </>
        )}
      </span>

      {/* RAM — fijo */}
      {memory && (
        <span
          className="shrink-0 font-mono opacity-70"
          title={`RAM proceso · ${formatBytes(memory.total)} total sistema`}
        >
          RAM {formatBytes(memory.rss)}
        </span>
      )}

      {/* Path — trunca desde la derecha, max 40% */}
      <span className="min-w-0 max-w-[40%] truncate font-mono opacity-70">{path}</span>
    </footer>
  )
}
