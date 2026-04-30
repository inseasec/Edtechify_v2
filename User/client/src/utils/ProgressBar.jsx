import React from "react";

export default function ProgressBar({ progress = 0, text = "Loading...", isUploading }) {
  if (!isUploading) return null;
  const pct = Math.min(100, Math.max(0, Number(progress) || 0));
  return (
    <div className="fixed inset-x-0 top-0 z-[100] px-4 pt-3">
      <div className="max-w-lg mx-auto rounded-lg bg-white shadow-lg border border-slate-200 p-3">
        <p className="text-sm text-slate-700 mb-2">{text}</p>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-300 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
