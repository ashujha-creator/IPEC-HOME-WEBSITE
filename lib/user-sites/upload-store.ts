// lib/user-sites/upload-store.ts
import { create } from "zustand";
import {
  ALLOWED_EXTENSIONS_SET,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_STRING,
} from "./constants";

export type PendingFile = {
  id: string; // client-generated, e.g. crypto.randomUUID()
  file: File;
  path: string; // editable relative path, e.g. "assets/logo.png"
  status: "pending" | "uploading" | "done" | "error";
  progress: number; // 0-100
  storageKey?: string;
  storageUrl?: string;
  error?: string;
};

type UploadWizardState = {
  files: PendingFile[];
  slug: string;
  slugAvailable: boolean | null; // null = not checked yet
  entryFile: string;
  submitting: boolean;
  submitError: string | null;

  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  updateFilePath: (id: string, path: string) => void;
  setFileProgress: (id: string, progress: number) => void;
  setFileUploaded: (id: string, storageKey: string, storageUrl: string) => void;
  setFileError: (id: string, error: string) => void;
  setSlug: (slug: string) => void;
  setSlugAvailable: (available: boolean | null) => void;
  setEntryFile: (path: string) => void;
  setSubmitting: (v: boolean) => void;
  setSubmitError: (e: string | null) => void;
  reset: () => void;
};

const initialState = {
  files: [] as PendingFile[],
  slug: "",
  slugAvailable: null as boolean | null,
  entryFile: "index.html",
  submitting: false,
  submitError: null as string | null,
};

function extensionOf(path: string): string {
  return path.split(".").pop()?.toLowerCase() ?? "";
}

function normalizePath(file: File): string {
  const rawPath = file.webkitRelativePath || file.name;
  // strip the first path segment (the picked folder's name)
  return rawPath.includes("/")
    ? rawPath.split("/").slice(1).join("/")
    : rawPath;
}

/**
 * Validates a single incoming file client-side, mirroring (a subset of)
 * the server's siteFileSchema checks. This is NOT a replacement for
 * server-side validation — it exists purely to give immediate, visible
 * feedback instead of a file silently vanishing into a later batch
 * rejection with no attributable cause.
 */
function validateNewFile(
  path: string,
  file: File,
  existingPaths: Set<string>,
): string | null {
  if (existingPaths.has(path.toLowerCase())) {
    return `Duplicate path: "${path}" is already in this upload`;
  }
  const ext = extensionOf(path);
  if (!ALLOWED_EXTENSIONS_SET.has(ext)) {
    return `File type ".${ext || "unknown"}" is not allowed`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File exceeds ${MAX_FILE_SIZE_STRING} limit`;
  }
  if (file.size === 0) {
    return "File is empty";
  }
  return null;
}

export const useUploadWizardStore = create<UploadWizardState>((set) => ({
  ...initialState,

  addFiles: (newFiles) =>
    set((state) => {
      const existingPaths = new Set(
        state.files.map((f) => f.path.toLowerCase()),
      );

      const added: PendingFile[] = [];
      for (const file of newFiles) {
        const path = normalizePath(file);
        const validationError = validateNewFile(path, file, existingPaths);

        added.push({
          id: crypto.randomUUID(),
          file,
          path,
          status: validationError ? "error" : "pending",
          progress: 0,
          error: validationError ?? undefined,
        });

        // Track this path even if invalid, so a second duplicate of the
        // same bad path is still reported as a duplicate too.
        existingPaths.add(path.toLowerCase());
      }

      return { files: [...state.files, ...added] };
    }),

  removeFile: (id) =>
    set((state) => ({ files: state.files.filter((f) => f.id !== id) })),

  updateFilePath: (id, path) =>
    set((state) => ({
      files: state.files.map((f) => {
        if (f.id !== id) return f;
        // Re-validate against the *other* files' current paths whenever
        // a user manually edits a path — catches duplicates/bad
        // extensions introduced by hand-editing, not just at add-time.
        const otherPaths = new Set(
          state.files
            .filter((other) => other.id !== id)
            .map((other) => other.path.toLowerCase()),
        );
        const validationError = validateNewFile(path, f.file, otherPaths);
        return {
          ...f,
          path,
          status: validationError
            ? "error"
            : f.status === "error"
              ? "pending"
              : f.status,
          error: validationError ?? undefined,
        };
      }),
    })),

  setFileProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id && (f.status === "pending" || f.status === "uploading")
          ? { ...f, progress, status: "uploading" }
          : f,
      ),
    })),

  setFileUploaded: (id, storageKey, storageUrl) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id
          ? { ...f, status: "done", progress: 100, storageKey, storageUrl }
          : f,
      ),
    })),

  setFileError: (id, error) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status: "error", error } : f,
      ),
    })),

  setSlug: (slug) => set({ slug, slugAvailable: null }),
  setSlugAvailable: (slugAvailable) => set({ slugAvailable }),
  setEntryFile: (entryFile) => set({ entryFile }),
  setSubmitting: (submitting) => set({ submitting }),
  setSubmitError: (submitError) => set({ submitError }),
  reset: () => set(initialState),
}));
