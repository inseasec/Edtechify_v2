import React from "react";

export default function UserImagePopUp({ onClose, src }) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-w-2xl max-h-[90vh] rounded-lg overflow-hidden bg-white p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/90 px-2 py-1 text-slate-700 shadow"
          aria-label="Close"
        >
          <i className="ri-close-line text-xl" />
        </button>
        <img src={src} alt="Profile" className="max-h-[85vh] w-auto object-contain rounded-md" />
      </div>
    </div>
  );
}
