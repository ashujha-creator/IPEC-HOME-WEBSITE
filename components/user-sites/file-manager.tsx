// components/user-sites/file-manager.tsx
"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

type SiteFileRow = {
  path: string;
  size: number;
  contentType: string;
  updatedAt: string;
};

type ApiErrorBody = {
  error?: string;
  details?: { fieldErrors?: Record<string, string[]> };
};

function extractErrorMessage(body: ApiErrorBody, fallback: string): string {
  if (typeof body.error === "string" && body.error.length > 0) {
    return body.error;
  }
  const firstFieldError = body.details?.fieldErrors
    ? Object.values(body.details.fieldErrors)[0]?.[0]
    : undefined;
  return firstFieldError ?? fallback;
}

export function FileManager({
  siteId,
  files: initialFiles,
}: {
  siteId: string;
  files: SiteFileRow[];
}) {
  const [files, setFiles] = useState<SiteFileRow[]>(initialFiles);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("siteFiles", {
    onClientUploadComplete: async (res) => {
      const uploaded = res?.[0];
      if (!uploaded || !busyPath) return;

      const replacedPath = busyPath;

      try {
        const putRes = await fetch(`/api/sites/${siteId}/files`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: {
              path: replacedPath,
              contentType: uploaded.type || "application/octet-stream",
              size: uploaded.size,
              storageKey: uploaded.key,
              storageUrl: uploaded.ufsUrl ?? uploaded.url,
              checksum: "pending", // see Stage 4 note re: checksum
            },
          }),
        });

        if (!putRes.ok) {
          let body: ApiErrorBody = {};
          try {
            body = await putRes.json();
          } catch {
            // non-JSON error response — fall through to generic message
          }
          const message = extractErrorMessage(
            body,
            "Failed to save replaced file",
          );
          console.error("FileManager: replace failed", {
            siteId,
            path: replacedPath,
            status: putRes.status,
            message,
          });
          setError(message);
          return;
        }

        // Update local state instead of a full page reload.
        setFiles((prev) =>
          prev.map((f) =>
            f.path === replacedPath
              ? {
                  ...f,
                  size: uploaded.size,
                  contentType: uploaded.type || "application/octet-stream",
                  updatedAt: new Date().toISOString(),
                }
              : f,
          ),
        );
        setError(null);
      } catch (e) {
        console.error("FileManager: replace request threw", {
          siteId,
          path: replacedPath,
          error: e,
        });
        setError(
          e instanceof Error ? e.message : "Failed to save replaced file",
        );
      } finally {
        setBusyPath(null);
      }
    },
    onUploadError: (err) => {
      console.error("FileManager: upload failed", { siteId, error: err });
      setError(err.message);
      setBusyPath(null);
    },
  });

  function handleReplace(path: string, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setBusyPath(path);
    setError(null);
    startUpload([file]);
  }

  async function handleDelete(path: string) {
    if (!confirm(`Delete ${path}?`)) return;
    setBusyPath(path);
    setError(null);
    try {
      const res = await fetch(
        `/api/sites/${siteId}/files?path=${encodeURIComponent(path)}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        let body: ApiErrorBody = {};
        try {
          body = await res.json();
        } catch {
          // non-JSON error response — fall through to generic message
        }
        const message = extractErrorMessage(body, "Delete failed");
        console.error("FileManager: delete failed", {
          siteId,
          path,
          status: res.status,
          message,
        });
        setError(message);
      } else {
        setFiles((prev) => prev.filter((f) => f.path !== path));
      }
    } catch (e) {
      console.error("FileManager: delete request threw", {
        siteId,
        path,
        error: e,
      });
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyPath(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {error && (
        <p className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
            <th className="px-4 py-2.5 font-medium">Path</th>
            <th className="px-4 py-2.5 font-medium">Size</th>
            <th className="px-4 py-2.5 font-medium">Updated</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {files.map((f) => (
            <tr key={f.path} className="hover:bg-gray-50/60">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-800">
                {f.path}
              </td>
              <td className="px-4 py-2.5 text-gray-500">
                {(f.size / 1024).toFixed(1)} KB
              </td>
              <td className="px-4 py-2.5 text-gray-500">
                {new Date(f.updatedAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-end gap-3">
                  <label
                    className={`cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700 ${
                      busyPath === f.path
                        ? "pointer-events-none opacity-40"
                        : ""
                    }`}
                  >
                    {busyPath === f.path ? "Working…" : "Replace"}
                    <input
                      type="file"
                      className="hidden"
                      disabled={busyPath === f.path}
                      onChange={(e) => handleReplace(f.path, e.target.files)}
                    />
                  </label>
                  <button
                    disabled={busyPath === f.path}
                    onClick={() => handleDelete(f.path)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {files.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-8 text-center text-sm text-gray-400"
              >
                No files in this site.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
