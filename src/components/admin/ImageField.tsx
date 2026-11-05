"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/upload";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

// Upload from the computer, or paste an image link.
export function ImageField({
  value,
  onChange,
  userId,
}: {
  value: string;
  onChange: (url: string) => void;
  userId: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file, userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="max-h-40 rounded-lg border border-ink/10 object-cover" />
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {value ? "Replace" : "Upload image"}
        </button>
        {value && (
          <button type="button" className="btn btn-danger" onClick={() => onChange("")}>
            <Trash2 size={14} /> Remove
          </button>
        )}
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…or paste an image link (https://…)"
        className="field"
      />
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
