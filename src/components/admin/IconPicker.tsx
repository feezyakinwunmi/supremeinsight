"use client";

import { useState } from "react";
import { ICON_NAMES, Icon } from "@/lib/icons";
import { X } from "lucide-react";

// Pick any icon from the library, or type your own emoji / symbol.
export function IconPicker({
  value,
  onChange,
  label = "Icon",
  allowNone = false,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  allowNone?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const names = ICON_NAMES.filter((n) => n.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={label}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/15 bg-white text-brand hover:bg-ink/5"
      >
        {value ? <Icon name={value} size={18} /> : <span className="text-xs text-ink/40">none</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Close" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-11 z-50 w-72 rounded-xl border border-ink/15 bg-white p-3 shadow-xl">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search icons…" className="field mb-2" />
            <div className="grid max-h-48 grid-cols-7 gap-1 overflow-y-auto">
              {names.map((n) => (
                <button
                  key={n}
                  type="button"
                  title={n}
                  onClick={() => {
                    onChange(n);
                    setOpen(false);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-md hover:bg-brand/10 ${value === n ? "bg-brand/15 text-brand" : "text-ink/70"}`}
                >
                  <Icon name={n} size={18} />
                </button>
              ))}
              {names.length === 0 && <p className="col-span-7 py-3 text-center text-xs text-ink/50">No icons match.</p>}
            </div>
            <div className="mt-3 border-t border-ink/10 pt-3">
              <label className="label">Or type an emoji / symbol</label>
              <div className="flex gap-2">
                <input
                  value={ICON_NAMES.includes(value) ? "" : value}
                  onChange={(e) => onChange(e.target.value.slice(0, 4))}
                  placeholder="🙏  ★  →"
                  className="field"
                />
                {allowNone && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    className="btn btn-ghost !px-3"
                    title="No icon"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
