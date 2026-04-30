import React, { useEffect, useMemo, useState } from "react";
import ChatBot from "../Components/ChatBot";
import ChatSupport from "../Components/ChatSupport";
import axios from "axios";

function mediaTypeFromName(name) {
  if (!name || typeof name !== "string") return "image";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
  return "image";
}

function fileUrl(filename, base) {
  const baseUrl = String(base ?? "").replace(/\/$/, "");
  if (!filename || typeof filename !== "string") return "";
  const path = filename.replace(/^\//, "");
  if (!baseUrl) return `/${path}`;
  return `${baseUrl}/${path}`;
}

export default function Home() {
  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);

  const userApiBaseUrl = window._CONFIG_.VITE_API_BASE_URL;
  const adminApiBaseUrl = window._CONFIG_.VITE_ADMIN_PROJECT_URL;
  const assetBase = adminApiBaseUrl || userApiBaseUrl;

  useEffect(() => {
    const fetchOrganisation = async () => {
      try {
        const res = await axios.get(`${adminApiBaseUrl}/organizations/details`);
        setOrganisation(res.data ?? null);
      } catch {
        setOrganisation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganisation();
  }, []);

  const bannerDisplay = useMemo(() => {
    const bannerName = organisation?.orgHome?.bannerVideo;
    if (!bannerName) return null;
    return {
      type: mediaTypeFromName(bannerName),
      src: fileUrl(bannerName, assetBase),
    };
  }, [organisation?.orgHome?.bannerVideo, assetBase]);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Banner Section */}
      <div className="w-full">
        <div className="relative w-full overflow-hidden bg-black">
          {bannerDisplay ? (
            <div className="relative h-[250px] md:h-[400px] w-full">
              {bannerDisplay.type === "video" ? (
                <video
                  key={bannerDisplay.src}
                  src={bannerDisplay.src}
                  className="h-full w-full object-cover pointer-events-none select-none"
                  autoPlay
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  aria-hidden="true"
                />
              ) : (
                <img
                  src={bannerDisplay.src}
                  alt="Banner"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="w-full h-[250px] md:h-[400px] bg-gray-200 flex items-center justify-center">
              <p className="text-gray-600">No banner found</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Your Existing Content */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 text-left">
        <h1 className="text-3xl font-semibold text-[var(--text-h)] mb-4">
          Home
        </h1>
        <p className="text-[var(--text)] leading-relaxed max-w-3xl">
          Welcome. Use the navigation above to explore About, Careers, Gallery,
          and Contact.
        </p>
      </section>

      {/* ✅ Chat Components */}
      {/* <ChatBot /> */}
      {/* <ChatSupport /> */}
    </>
  );
}