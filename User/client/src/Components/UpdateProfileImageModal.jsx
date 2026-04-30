import React, { useMemo, useRef, useState } from "react";

export default function UpdateProfileImageModal({
  isOpen,
  onClose,
  currentSrc,
  onUpload,
  uploading = false,
}) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  if (!isOpen) return null;

  const handlePick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (e.target) e.target.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    await onUpload(selectedFile);
    setSelectedFile(null);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white px-6 py-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border border-red-200 bg-white text-red-600 shadow"
          aria-label="Close"
        >
          <i className="ri-close-line text-xl" />
        </button>

        <div className="mx-auto mb-8 h-40 w-40 rounded-full bg-slate-100 p-2">
          <div className="h-full w-full overflow-hidden rounded-full bg-white">
            <img
              src={previewUrl || currentSrc || ""}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <h2 className="text-center text-2xl font-semibold text-slate-800">
          Update Your Profile Picture
        </h2>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        <div className="mt-10 flex items-center justify-center">
          <button
            type="button"
            onClick={selectedFile ? handleUpload : handlePick}
            disabled={uploading}
            className="group relative grid h-24 w-24 place-items-center rounded-full bg-slate-200 disabled:opacity-60"
            aria-label={selectedFile ? "Upload selected image" : "Choose image"}
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-orange-500 text-white shadow">
              <i className="ri-image-edit-fill text-xl" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

