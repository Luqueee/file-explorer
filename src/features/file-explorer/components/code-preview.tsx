import { useEffect, useState } from "react"
import { codeToHtml } from "shiki"

const EXT_TO_LANG: Record<string, string> = {
  ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
  rs: "rust", py: "python", go: "go",
  md: "markdown", mdx: "mdx",
  json: "json", jsonc: "jsonc",
  html: "html", css: "css", scss: "scss",
  sh: "bash", bash: "bash", zsh: "bash", fish: "fish",
  toml: "toml", yaml: "yaml", yml: "yaml",
  sql: "sql", graphql: "graphql",
  c: "c", cpp: "cpp", h: "c",
  swift: "swift", kt: "kotlin", java: "java",
  rb: "ruby", php: "php",
  xml: "xml", svg: "xml",
  dockerfile: "dockerfile",
  lua: "lua", vim: "viml",
  r: "r",
}

function langFromPath(path: string): string | null {
  const ext = path.split(".").at(-1)?.toLowerCase()
  if (!ext) return null
  const base = path.split("/").at(-1)?.toLowerCase()
  if (base === "dockerfile") return "dockerfile"
  return EXT_TO_LANG[ext] ?? null
}

interface Props {
  path: string
  content: string
  truncated: boolean
  compact: boolean
}

export function CodePreview({ path, content, truncated, compact }: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const lang = langFromPath(path)

  useEffect(() => {
    if (!lang) { setHtml(null); return }
    let cancelled = false
    codeToHtml(content, { lang, theme: "github-dark-default" })
      .then((h) => { if (!cancelled) setHtml(h) })
      .catch(() => { if (!cancelled) setHtml(null) })
    return () => { cancelled = true }
  }, [content, lang])

  const containerClass = compact
    ? "w-full overflow-auto text-[11px]"
    : "w-full overflow-auto max-h-[70vh] text-xs"

  if (!lang || !html) {
    return (
      <pre className={`rounded bg-muted/40 p-3 font-mono whitespace-pre-wrap ${containerClass}`}>
        {content}
        {truncated && (
          <span className="mt-3 block italic text-muted-foreground">… (contenido truncado)</span>
        )}
      </pre>
    )
  }

  return (
    <div className={`rounded ${containerClass}`}>
      <div
        // shiki output is trusted — generated locally from user's own files
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
        className="[&>pre]:p-3 [&>pre]:m-0 [&>pre]:font-mono [&>pre]:leading-relaxed [&>pre]:rounded [&>pre]:min-w-max"
      />
      {truncated && (
        <p className="px-3 pb-2 text-xs italic text-muted-foreground">… (contenido truncado)</p>
      )}
    </div>
  )
}
