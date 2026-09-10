// components/user-sites/upload-wizard.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useUploadThing } from "@/lib/uploadthing"; // generateReactHelpers output, adjust path
import { useUploadWizardStore } from "@/lib/user-sites/upload-store";
import { createSiteManifestSchema } from "@/lib/user-sites/schemas";
import { redirect } from "next/navigation";

type StepId = 1 | 2 | 3;

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "Add files" },
  { id: 2, label: "Site details" },
  { id: 3, label: "Review & publish" },
];

function StatusBadge({
  status,
}: {
  status: "pending" | "uploading" | "done" | "error";
}) {
  const styles: Record<typeof status, string> = {
    pending: "bg-gray-100 text-gray-600",
    uploading: "bg-blue-50 text-blue-700",
    done: "bg-green-50 text-green-700",
    error: "bg-red-50 text-red-700",
  };
  const labels: Record<typeof status, string> = {
    pending: "Pending",
    uploading: "Uploading",
    done: "Uploaded",
    error: "Error",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function StepIndicator({ current }: { current: StepId }) {
  return (
    <ol className="flex items-center w-full mb-8">
      {STEPS.map((step, i) => {
        const isComplete = step.id < current;
        const isActive = step.id === current;
        return (
          <li key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isComplete
                    ? "bg-indigo-600 text-white"
                    : isActive
                      ? "border-2 border-indigo-600 text-indigo-600"
                      : "border-2 border-gray-200 text-gray-400"
                }`}
              >
                {isComplete ? "✓" : step.id}
              </div>
              <span
                className={`hidden sm:inline text-sm font-medium ${
                  isActive
                    ? "text-gray-900"
                    : isComplete
                      ? "text-gray-700"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 rounded transition-colors ${
                  isComplete ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function UploadWizard() {
  const store = useUploadWizardStore();
  const [step, setStep] = useState<StepId>(1);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Guards against a stale, slow slug-check response overwriting a
  // newer one (debounce alone doesn't prevent out-of-order resolution).
  const slugCheckSeq = useRef(0);

  const { startUpload, isUploading } = useUploadThing("siteFiles", {
    onUploadProgress: (progress) => {
      store.files
        .filter((f) => f.status === "uploading")
        .forEach((f) => store.setFileProgress(f.id, progress));
    },
    // Completion/error handling intentionally lives ONLY in
    // handleUploadAll below, where the request/response arrays are
    // captured in the same closure and matched 1:1 by index. Duplicating
    // that logic here as well (as before) caused each file to be
    // written to the store twice from two different code paths.
  });

  async function checkSlug(slug: string) {
    if (slug.length < 3) return;
    const seq = ++slugCheckSeq.current;
    setCheckingSlug(true);
    try {
      const res = await fetch("/api/sites/check-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (seq === slugCheckSeq.current) {
        store.setSlugAvailable(data.available);
      }
    } catch {
      if (seq === slugCheckSeq.current) {
        store.setSlugAvailable(null);
      }
    } finally {
      if (seq === slugCheckSeq.current) {
        setCheckingSlug(false);
      }
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (store.slug) checkSlug(store.slug);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  async function handleUploadAll() {
    const pendingFiles = store.files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    pendingFiles.forEach((f) => store.setFileProgress(f.id, 0));

    try {
      const result = await startUpload(pendingFiles.map((f) => f.file));
      if (!result) {
        // startUpload returns undefined if the whole batch was
        // rejected/failed before any per-file callback fired.
        pendingFiles.forEach((f) => store.setFileError(f.id, "Upload failed"));
        return;
      }

      result.forEach((uploaded, i) => {
        const pending = pendingFiles[i]; // same array, same order — reliable 1:1 match
        if (pending) {
          store.setFileUploaded(
            pending.id,
            uploaded.key,
            uploaded.ufsUrl ?? uploaded.url,
          );
        }
      });
    } catch (e) {
      pendingFiles.forEach((f) =>
        store.setFileError(
          f.id,
          e instanceof Error ? e.message : "Upload failed",
        ),
      );
    }
  }

  async function handleSubmit() {
    store.setSubmitting(true);
    store.setSubmitError(null);
    try {
      const manifest = {
        slug: store.slug,
        entryFile: store.entryFile,
        files: store.files
          .filter((f) => f.status === "done")
          .map((f) => ({
            path: f.path,
            contentType: f.file.type || "application/octet-stream",
            size: f.file.size,
            storageKey: f.storageKey!,
            storageUrl: f.storageUrl!,
            checksum: "pending", // see note below on checksum
          })),
      };

      const clientCheck = createSiteManifestSchema.safeParse(manifest);
      if (!clientCheck.success) {
        const flat = clientCheck.error.flatten();
        store.setSubmitError(
          flat.fieldErrors.slug?.[0] ??
            flat.fieldErrors.entryFile?.[0] ??
            flat.fieldErrors.files?.[0] ??
            flat.formErrors[0] ??
            "Invalid submission",
        );
        return;
      }

      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manifest),
      });

      if (!res.ok) {
        let err: {
          error?: string;
          details?: { fieldErrors?: Record<string, string[]> };
        } = {};
        try {
          err = await res.json();
        } catch {
          // response wasn't JSON — fall through to generic message
        }
        // Fixed: previously read err.error?.slug, but the server's
        // error shape is { error: string, details?: {...} } — err.error
        // is a plain string, so .slug was always undefined and the real
        // reason was silently discarded. Now prefers the structured
        // details.fieldErrors.slug, falling back to the top-level
        // error string, which is always present.
        const slugDetail = err.details?.fieldErrors?.slug?.[0];
        store.setSubmitError(
          slugDetail ?? err.error ?? "Failed to create site",
        );
        return;
      }

      const { url } = await res.json();
      redirect(`/sites?created=${encodeURIComponent(url)}`);
    } catch (e) {
      store.setSubmitError(
        e instanceof Error ? e.message : "Failed to create site",
      );
    } finally {
      store.setSubmitting(false);
    }
  }

  const hasFiles = store.files.length > 0;
  const hasErrorFiles = store.files.some((f) => f.status === "error");
  const allUploadableFilesDone =
    hasFiles &&
    store.files
      .filter((f) => f.status !== "error")
      .every((f) => f.status === "done");
  const pendingCount = store.files.filter((f) => f.status === "pending").length;

  const canGoToStep2 = hasFiles && allUploadableFilesDone && !hasErrorFiles;
  const canGoToStep3 =
    canGoToStep2 && store.slug.length >= 3 && store.slugAvailable === true;

  const totalSizeMb = useMemo(
    () =>
      (
        store.files.reduce((sum, f) => sum + f.file.size, 0) /
        (1024 * 1024)
      ).toFixed(2),
    [store.files],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator current={step} />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* ---------------- Step 1: Add files ---------------- */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Add your site files
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a folder containing your site. An HTML file is required.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40">
              <span className="text-sm font-medium text-indigo-600">
                Click to choose a folder
              </span>
              <span className="mt-1 text-xs text-gray-400">
                or drag and drop files
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                // @ts-expect-error - webkitdirectory is non-standard but widely supported
                webkitdirectory=""
                onChange={(e) =>
                  e.target.files && store.addFiles(Array.from(e.target.files))
                }
              />
            </label>

            {hasFiles && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-2 text-xs text-gray-500">
                  <span>
                    {store.files.length} file
                    {store.files.length !== 1 ? "s" : ""} · {totalSizeMb} MB
                  </span>
                  {hasErrorFiles && (
                    <span className="font-medium text-red-600">
                      {store.files.filter((f) => f.status === "error").length}{" "}
                      file(s) need attention
                    </span>
                  )}
                </div>
                <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
                  {store.files.map((f) => (
                    <li
                      key={f.id}
                      className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:items-center sm:gap-3"
                    >
                      <input
                        value={f.path}
                        onChange={(e) =>
                          store.updateFilePath(f.id, e.target.value)
                        }
                        className={`flex-1 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 ${
                          f.status === "error"
                            ? "border-red-300 focus:ring-red-400"
                            : "border-gray-200 focus:ring-indigo-400"
                        }`}
                      />
                      <div className="flex items-center gap-2 sm:w-40 sm:justify-end">
                        <StatusBadge status={f.status} />
                        {f.status === "uploading" && (
                          <span className="text-xs text-gray-400">
                            {f.progress}%
                          </span>
                        )}
                      </div>
                      {f.status === "error" && f.error && (
                        <span className="text-xs text-red-600 sm:basis-full">
                          {f.error}
                        </span>
                      )}
                      <button
                        onClick={() => store.removeFile(f.id)}
                        className="text-gray-400 hover:text-red-600 sm:ml-1"
                        aria-label={`Remove ${f.path}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleUploadAll}
                disabled={isUploading || pendingCount === 0}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isUploading
                  ? "Uploading…"
                  : pendingCount > 0
                    ? `Upload ${pendingCount} file${pendingCount !== 1 ? "s" : ""}`
                    : "All files uploaded"}
              </button>

              <button
                onClick={() => setStep(2)}
                disabled={!canGoToStep2}
                className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ---------------- Step 2: Site details ---------------- */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Choose your site&apos;s address
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                This will be part of your site&apos;s public URL.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Slug
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={store.slug}
                  onChange={(e) => store.setSlug(e.target.value.toLowerCase())}
                  placeholder="your-site-name"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                {checkingSlug && (
                  <span className="text-xs text-gray-400">checking…</span>
                )}
              </div>
              {!checkingSlug && store.slugAvailable === false && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  Taken or invalid
                </p>
              )}
              {!checkingSlug && store.slugAvailable === true && (
                <p className="mt-1.5 text-xs font-medium text-green-600">
                  Available
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Entry file
              </label>
              <select
                value={store.entryFile}
                onChange={(e) => store.setEntryFile(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {store.files
                  .filter((f) => f.path.toLowerCase().endsWith(".html"))
                  .map((f) => (
                    <option key={f.id} value={f.path}>
                      {f.path}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoToStep3}
                className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ---------------- Step 3: Review & publish ---------------- */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Review & publish
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Double-check the details below before publishing.
              </p>
            </div>

            <dl className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500">Slug</dt>
                <dd className="font-medium text-gray-900">{store.slug}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Entry file</dt>
                <dd className="font-medium text-gray-900">{store.entryFile}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Files</dt>
                <dd className="font-medium text-gray-900">
                  {store.files.filter((f) => f.status === "done").length}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Total size</dt>
                <dd className="font-medium text-gray-900">{totalSizeMb} MB</dd>
              </div>
            </dl>

            {store.submitError && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {store.submitError}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={store.submitting}
                className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={store.submitting}
                className="rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {store.submitting ? "Publishing…" : "Publish site"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
