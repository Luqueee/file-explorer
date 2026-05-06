# Kenafold — Task Backlog

Legend: 🔴 bug/debt · 🟣 feature · 🔄 refactor · ⚡ UX · 🧪 testing · 📦 distribution

---

## 🔴 Bugs / Deuda técnica

- [ ] **Tests de selección incompletos** — modificación pendiente en `use-selection.ts` sin coverage actualizado. Verificar tests en `use-selection.test.ts`.
- [ ] **Cancelación robusta de archive ops** — verificar leak de handles si user cancela mid-extract en `src-tauri/src/smb.rs`.
- [ ] **Race condition watcher** — auditar `watcher.rs` cuando dir cambia durante listado paginado.
- [ ] **Memory leak preview grande** — quick look video/PDF sin unmount cleanup.

---

## 🟣 Features

- [ ] **Tags/Labels de archivos** — color-coded, persistidos en SQLite local. Filtrable desde sidebar.
- [ ] **Bulk rename con regex/patrón** — `{n}`, `{ext}`, `{date}` tokens. Preview antes de aplicar.
- [ ] **Tree view en sidebar** — expand/collapse de carpetas favoritas sin abrir pane.
- [ ] **Comparador de carpetas** — diff dos directorios (size, mtime, hash). Útil para sync manual.
- [ ] **Hash/checksum panel** — MD5/SHA256/SHA1 al seleccionar archivo. Copy-to-clipboard.
- [ ] **Dark mode toggle real** — persistir en settings, respetar `prefers-color-scheme`.
- [ ] **Trash/papelera nativa** — usar crate `trash` en Rust. Restore desde UI.
- [ ] **Mass tagging por extensión** — seleccionar todos `.pdf` en árbol y aplicar tag.
- [ ] **Preview de código con syntax highlight** — shiki para `.ts/.rs/.py/.md`.
- [ ] **Sesiones persistidas** — restaurar paneles abiertos al reabrir app.
- [ ] **Comandos personalizados** — user define shell command en settings, aparece en context menu (ej. "Open in iTerm").
- [ ] **Filtros guardados** — query del search palette → bookmark reutilizable.
- [ ] **Comparar imágenes lado-a-lado** — viewer dual.
- [ ] **Espacio en disco por carpeta** — tree map o sunburst (estilo Disk Inventory X).
- [ ] **Integración Git** — badge en archivos dentro de repo (modified/staged/untracked).

---

## 🔄 Refactors / Performance

- [ ] **Virtualizar grid view** — actualmente solo list view virtualizado.
- [ ] **Worker para hash/thumbnails** — sacar del main thread Rust con `tokio::spawn`.
- [ ] **Split de explorer-context** — `explorer-context.tsx` creciendo. Separar en slices: selection, view, navigation.
- [ ] **Cache de listados** — invalidar via watcher, no re-listar en cada render.
- [ ] **Lazy load vscode-icons** — bundle actual incluye todos los íconos.

---

## ⚡ UX / Pulido

- [ ] **Breadcrumb editable** — click en breadcrumb → input path manual.
- [ ] **Multi-tab por pane** — chrome-style tabs dentro de cada pane.
- [ ] **Quick filter inline** — type-ahead en pane sin abrir search palette.
- [ ] **Drag preview con count** — badge con cantidad al arrastrar N archivos.
- [ ] **Atajos visibles en menús** — mostrar binding de hotkey al lado de cada acción de context menu.
- [ ] **Onboarding tour** — primera vez: highlight de features clave.
- [ ] **Notificaciones nativas macOS** — al terminar archive/copy largo en background.

---

## 🧪 Testing

- [ ] **Tests Rust de archive ops** — `archive.rs` sin coverage visible.
- [ ] **E2E con Playwright + Tauri** — flow completo: navegar, copiar, extraer.
- [ ] **Snapshot tests de pane** — list/grid view rendering.

---

## 📦 Distribución

- [ ] **Auto-updater Tauri** — `tauri-plugin-updater`.
- [ ] **Universal binary macOS** — Intel + Apple Silicon en mismo bundle.
- [ ] **Notarización + DMG branded** — pipeline de release.
- [ ] **Homebrew cask** — `brew install --cask kenafold`.

---

## Sugerencias de orden

**Pack UX rápido** (alto retorno percibido):

> Dark mode → Breadcrumb editable → Quick filter inline

**Pack foundation técnica** (escala el resto):

> Split context → Grid virtualization → Cache de listados
