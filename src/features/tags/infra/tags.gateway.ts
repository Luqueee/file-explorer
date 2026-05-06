import { invoke } from "@tauri-apps/api/core"

export const tagsGateway = {
  get: (path: string) => invoke<string[]>("tags_get", { path }),
  set: (path: string, tagId: string) => invoke<void>("tags_set", { path, tagId }),
  remove: (path: string, tagId: string) => invoke<void>("tags_remove", { path, tagId }),
  getAll: () => invoke<Record<string, string[]>>("tags_get_all"),
  getByTag: (tagId: string) => invoke<string[]>("tags_get_by_tag", { tagId }),
}
