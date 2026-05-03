import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { FileQuestion, Loader2, X } from "lucide-react"
import { convertFileSrc } from "@tauri-apps/api/core"
import { fsGateway, type Preview } from "@/features/filesystem/infra/fs.gateway"
import { fsErrorMessage } from "@/features/filesystem/domain/fs-error"
import { formatSize } from "@/shared/lib/format"
import type { FileEntry } from "@/features/filesystem/domain/file-entry"

interface Props {
  entry: FileEntry | null
  onClose: () => void
}

export function QuickLook({ entry, onClose }: Props) {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!entry || entry.is_dir) {
      setPreview(null)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fsGateway
      .preview(entry.path)
      .then((p) => {
        if (!cancelled) setPreview(p)
      })
      .catch((e) => {
        if (!cancelled) setError(fsErrorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [entry])

  useEffect(() => {
    if (!entry) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [entry, onClose])

  if (!entry) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-[80vw] max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-3 border-b border-border/60 px-4 py-2">
          <span className="flex-1 truncate text-sm font-medium">
            {entry.name}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatSize(entry.size)}
          </span>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center overflow-auto p-4">
          {loading && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
          {error && !loading && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {!loading && !error && preview && (
            <PreviewBody preview={preview} path={entry.path} />
          )}
        </div>

        <footer className="border-t border-border/60 px-4 py-1.5 text-[11px] text-muted-foreground">
          Espacio o Esc para cerrar
        </footer>
      </div>
    </div>,
    document.body
  )
}

function PreviewBody({ preview, path }: { preview: Preview; path: string }) {
  const assetSrc = useMemo(() => convertFileSrc(path), [path])
  switch (preview.kind) {
    case "image":
      return (
        <img
          src={assetSrc}
          alt=""
          className="max-h-[70vh] max-w-full object-contain"
        />
      )
    case "audio":
      return <audio controls src={assetSrc} className="w-full max-w-md" />
    case "video":
      return (
        <video controls src={assetSrc} className="max-h-[70vh] max-w-full" />
      )
    case "pdf":
      return (
        <iframe
          src={`${assetSrc}#toolbar=1&view=FitH`}
          className="h-[80vh] w-full"
          title="PDF"
        />
      )
    case "text":
      return (
        <pre className="max-h-[70vh] w-full overflow-auto rounded bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap">
          {preview.content}
          {preview.truncated && (
            <span className="mt-3 block text-muted-foreground italic">
              … (contenido truncado)
            </span>
          )}
        </pre>
      )
    case "unsupported":
      return (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <FileQuestion className="h-10 w-10" />
          <p className="text-sm">
            Sin previsualización
            {preview.ext ? ` para .${preview.ext}` : ""}
          </p>
        </div>
      )
  }
}
