import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import AuthHeroTagline from "@/Components/AuthHeroTagline";

export default function AuthenticationSideImages() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingText, setSavingText] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [current, setCurrent] = useState({
    USER_SIGNIN_SIDE_IMAGE_URL: "",
    USER_SIGNUP_SIDE_IMAGE_URL: "",
    USER_AUTH_TITLE_PRIMARY: "",
    USER_AUTH_TITLE_ACCENT: "",
    USER_AUTH_TAGLINE: "",
  });

  /** One file applied to both Sign In and Sign Up (backend: sharedSideImage) */
  const [sharedImage, setSharedImage] = useState(null);

  const adminBase = window._CONFIG_?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    api
      .get("/admin/auth-ui-config")
      .then((res) => {
        if (!mounted) return;

        setCurrent({
          USER_SIGNIN_SIDE_IMAGE_URL: res?.data?.USER_SIGNIN_SIDE_IMAGE_URL || "",
          USER_SIGNUP_SIDE_IMAGE_URL: res?.data?.USER_SIGNUP_SIDE_IMAGE_URL || "",
          USER_AUTH_TITLE_PRIMARY: res?.data?.USER_AUTH_TITLE_PRIMARY || "",
          USER_AUTH_TITLE_ACCENT: res?.data?.USER_AUTH_TITLE_ACCENT || "",
          USER_AUTH_TAGLINE: res?.data?.USER_AUTH_TAGLINE || "",
        });
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data || "Failed to load config");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const serverPreviewUrl = useMemo(() => {
    const a = String(current.USER_SIGNIN_SIDE_IMAGE_URL || "").trim();
    const b = String(current.USER_SIGNUP_SIDE_IMAGE_URL || "").trim();
    if (a && b && a === b) return resolveToAbsolute(a);
    if (a) return resolveToAbsolute(a);
    if (b) return resolveToAbsolute(b);
    return "";
    function resolveToAbsolute(path) {
      if (!path) return "";
      if (/^https?:\/\//i.test(path)) return path;
      try {
        return new URL(path.startsWith("/") ? path : `/${path}`, adminBase + "/").toString();
      } catch {
        return path;
      }
    }
  }, [current.USER_SIGNIN_SIDE_IMAGE_URL, current.USER_SIGNUP_SIDE_IMAGE_URL, adminBase]);

  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  useEffect(() => {
    if (!sharedImage) {
      setLocalPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(sharedImage);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [sharedImage]);

  const previewImage = localPreviewUrl || serverPreviewUrl;

  const setTextField = (key, value) => {
    setCurrent((c) => ({ ...c, [key]: value }));
  };

  const handleSaveText = async () => {
    setSavingText(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.put(
        "/admin/auth-ui-config",
        {
          USER_AUTH_TITLE_PRIMARY: String(current.USER_AUTH_TITLE_PRIMARY ?? "").trim(),
          USER_AUTH_TITLE_ACCENT: String(current.USER_AUTH_TITLE_ACCENT ?? "").trim(),
          USER_AUTH_TAGLINE: String(current.USER_AUTH_TAGLINE ?? "").trim(),
        }
      );
      setCurrent((c) => ({
        ...c,
        USER_AUTH_TITLE_PRIMARY: res?.data?.USER_AUTH_TITLE_PRIMARY || "",
        USER_AUTH_TITLE_ACCENT: res?.data?.USER_AUTH_TITLE_ACCENT || "",
        USER_AUTH_TAGLINE: res?.data?.USER_AUTH_TAGLINE || "",
      }));
      setMessage("Sign In / Sign Up text saved.");
    } catch (e) {
      setError(e?.response?.data || "Failed to save text");
    } finally {
      setSavingText(false);
    }
  };

  const handleUpload = async () => {
    if (!sharedImage) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append("sharedSideImage", sharedImage);

      const res = await api.post("/admin/auth-ui-config/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setCurrent({
        USER_SIGNIN_SIDE_IMAGE_URL: res?.data?.USER_SIGNIN_SIDE_IMAGE_URL || "",
        USER_SIGNUP_SIDE_IMAGE_URL: res?.data?.USER_SIGNUP_SIDE_IMAGE_URL || "",
        USER_AUTH_TITLE_PRIMARY: res?.data?.USER_AUTH_TITLE_PRIMARY || "",
        USER_AUTH_TITLE_ACCENT: res?.data?.USER_AUTH_TITLE_ACCENT || "",
        USER_AUTH_TAGLINE: res?.data?.USER_AUTH_TAGLINE || "",
      });

      setSharedImage(null);
      setMessage("Photo saved for both Sign In and Sign Up.");
    } catch (e) {
      setError(e?.response?.data || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const bothSameInDb =
    current.USER_SIGNIN_SIDE_IMAGE_URL &&
    current.USER_SIGNUP_SIDE_IMAGE_URL &&
    current.USER_SIGNIN_SIDE_IMAGE_URL === current.USER_SIGNUP_SIDE_IMAGE_URL;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* LEFT — controls */}
      <div className="flex w-full items-start justify-center border-b border-slate-200 bg-white p-6 md:w-[34%] md:border-b-0 md:border-r">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In / Sign Up image
          </h1>
      

          {message && (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              {String(error)}
            </p>
          )}

          {/* Highlighted single upload */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hero background
            </p>
            <label
              className="group mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-400 bg-gradient-to-b from-indigo-50 to-white p-6 shadow-[0_0_0_1px_rgba(99,102,241,0.15),0_4px_14px_rgba(99,102,241,0.2)] transition hover:border-indigo-500 hover:from-indigo-100/80 hover:shadow-indigo-200/50"
            >
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => setSharedImage(e.target.files?.[0] || null)}
              />
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 group-hover:ring-indigo-200">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <span className="text-center">
                <span className="block text-base font-bold text-indigo-900">
                  Upload image
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">
                  JPG, PNG, WebP — one image for both pages
                </span>
              </span>
            </label>

            {sharedImage && (
              <p className="mt-2 text-center text-sm font-medium text-slate-700">
                Selected: {sharedImage.name}
              </p>
            )}

            <button
              type="button"
              onClick={handleUpload}
              disabled={saving || !sharedImage}
              className="mt-4 h-12 w-full rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Uploading…" : "Save & apply to both pages"}
            </button>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Side panel headline &amp; tagline
            </p>
            {/* <p className="mt-1 text-sm text-slate-600">
              Shown on the user Sign In and Sign Up pages (right-hand hero). Leave blank to use
              default copy on the site.
            </p> */}
            <label className="mt-4 block text-sm font-medium text-slate-700">
              First part 
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={current.USER_AUTH_TITLE_PRIMARY}
              onChange={(e) => setTextField("USER_AUTH_TITLE_PRIMARY", e.target.value)}
              placeholder="Welcome"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">
              Second Orange line
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={current.USER_AUTH_TITLE_ACCENT}
              onChange={(e) => setTextField("USER_AUTH_TITLE_ACCENT", e.target.value)}
              placeholder="Users"
            />
            <label className="mt-3 block text-sm font-medium text-slate-700">Tagline</label>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={current.USER_AUTH_TAGLINE}
              onChange={(e) => setTextField("USER_AUTH_TAGLINE", e.target.value)}
              placeholder="Time and Tide wait for none"
            />
            <button
              type="button"
              onClick={handleSaveText}
              disabled={savingText}
              className="mt-4 h-12 w-full rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingText ? "Saving…" : "Save text"}
            </button>
          </div>

          {loading && (
            <p className="mt-6 text-sm text-slate-500">Loading current settings…</p>
          )}

          {!loading && (bothSameInDb || (!current.USER_SIGNIN_SIDE_IMAGE_URL && !current.USER_SIGNUP_SIDE_IMAGE_URL)) && (
            <p className="mt-4 text-xs text-slate-500">
              {bothSameInDb
                ? "Current saved image is shared between Sign In and Sign Up."
                : "No image saved yet. Upload one above to show it on both auth pages."}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT — live preview (same for both) */}
      <div className="relative min-h-[45vh] flex-1 overflow-hidden bg-slate-900 md:min-h-screen">
        {previewImage ? (
          <img
            src={previewImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400">
            No image — upload on the left
          </div>
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full min-h-[45vh] flex-col items-center justify-center px-6 text-center md:min-h-screen">
        
          <h2 className="mt-2 text-4xl font-semibold text-white md:text-5xl">
            {(String(current.USER_AUTH_TITLE_PRIMARY || "").trim() || "Welcome")}{" "}
            <span className="text-orange-500">
              {String(current.USER_AUTH_TITLE_ACCENT || "").trim() || "Users"}
            </span>
          </h2>
          <AuthHeroTagline
            text={
              String(current.USER_AUTH_TAGLINE || "").trim() || "Time and Tide wait for none"
            }
            className="mt-4 max-w-md text-base text-slate-200"
          />
        </div>
      </div>
    </div>
  );
}
