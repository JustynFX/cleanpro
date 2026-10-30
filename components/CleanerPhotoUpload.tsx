"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

/** Shrinks a phone photo (often 4-8 MB) to about 1600px JPEG so it uploads fast on mobile data. */
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bmp, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("compress failed"))), "image/jpeg", 0.8)
  );
}

export default function CleanerPhotoUpload({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await compress(file);
      const body = new FormData();
      body.append("jobId", jobId);
      body.append("file", blob, "job-done.jpg");
      const res = await fetch("/api/upload-proof", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Upload failed. Please try again.");
        setBusy(false);
        return;
      }
      router.push("/cleaner/today?done=1");
      router.refresh();
    } catch {
      setError("We could not read that photo. Please take another one.");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Camera aria-hidden="true" className="h-5 w-5" /> Job done photo</h2>
      <p className="mt-1 text-sm text-gray-700">
        Take a clear photo of the finished work. Submitting it closes the job, and the customer gets it by email.
      </p>

      <label htmlFor="proof" className="mt-4 flex h-12 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-brand-700 px-4 text-sm font-semibold text-brand-700">
        {file ? "Choose a different photo" : "Take or choose a photo"}
      </label>
      <input id="proof" type="file" accept="image/*" capture="environment" onChange={onPick} disabled={busy} className="sr-only" />

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview of the photo you are about to submit" className="mt-4 h-56 w-full rounded-lg border object-cover" />
      )}

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <button type="button" onClick={submit} disabled={!file || busy}
        className="mt-4 h-12 w-full rounded-lg bg-brand-700 font-semibold text-white hover:opacity-90 disabled:opacity-50">
        {busy ? "Uploading photo..." : "Submit photo and finish job"}
      </button>
    </div>
  );
}
