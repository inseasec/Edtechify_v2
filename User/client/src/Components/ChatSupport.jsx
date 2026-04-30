import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import api from "../api";
import { decodeToken } from "../authConfig";
import { showErrorToast } from "../utils/toastUtils";

export default function ChatSupport() {
  const [config, setConfig] = useState({
    mobileNo: "",
    whatsappEnabled: false,
    talkToEnabled: false,
    talkToKey: "",
  });
  const [userData, setUserData] = useState({});
  const [isShow, setIsShow] = useState(true);

  const user_ID = decodeToken();
  const tawkLoadedRef = useRef(false);
  const loadPromiseRef = useRef(null);

  useEffect(() => {
    if (!user_ID) {
      setUserData({});
      return;
    }
    const userInfo = async () => {
      try {
        const response = await api.get(`/users/getUser/${user_ID}`);
        setUserData(response.data ?? {});
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    userInfo();
  }, [user_ID]);

  useEffect(() => {
    let cancelled = false;
    const fetchConfig = async () => {
      try {
        // Chatbot settings are served by the Admin backend.
        const adminBaseUrl = window._CONFIG_.VITE_ADMIN_PROJECT_URL;
        const res = await axios.get(`${adminBaseUrl}/api/chatbot/get`);
        if (cancelled) return;
        if (res.data) {
          setConfig({
            mobileNo: res.data.mobileNo ?? "",
            whatsappEnabled: Boolean(res.data.whatsappEnabled),
            talkToEnabled: Boolean(res.data.talkToEnabled),
            talkToKey: res.data.talkToKey ?? "",
          });
        }
      } catch (err) {
        console.error("Error getting config", err);
      }
    };
    fetchConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadTawk = () => {
    if (!config.talkToKey) return Promise.reject(new Error("Missing talkToKey"));
    if (tawkLoadedRef.current && window.Tawk_API) return Promise.resolve();
    if (loadPromiseRef.current) return loadPromiseRef.current;

    loadPromiseRef.current = new Promise((resolve, reject) => {
      const raw = String(config.talkToKey || "").trim();

      // Tawk embed requires: https://embed.tawk.to/{propertyId}/{widgetId}
      // We accept:
      // - full embed URL
      // - direct chat link: https://tawk.to/chat/{propertyId}/{widgetId}
      // - just "propertyId/widgetId"
      const extractEmbedPath = (value) => {
        const v = String(value || "").trim();
        const embed = v.match(/embed\.tawk\.to\/([^?\s"'<>]+)/i);
        if (embed?.[1]) return embed[1].replace(/^\/+/, "").replace(/\/+$/, "");
        const chat = v.match(/tawk\.to\/chat\/([^?\s"'<>]+)/i);
        if (chat?.[1]) return chat[1].replace(/^\/+/, "").replace(/\/+$/, "");
        return v.replace(/^\/+/, "").replace(/\/+$/, "");
      };

      const embedPath = extractEmbedPath(raw);
      const parts = embedPath.split("/").filter(Boolean);
      if (parts.length < 2) {
        loadPromiseRef.current = null;
        tawkLoadedRef.current = false;
        reject(new Error("Invalid Tawk.to key. Expected propertyId/widgetId."));
        return;
      }

      // Keep only first 2 parts (propertyId/widgetId). Some pasted values may include extra path.
      const normalizedEmbedPath = `${parts[0]}/${parts[1]}`;

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://embed.tawk.to/${normalizedEmbedPath}`;
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      script.onload = () => {
        tawkLoadedRef.current = true;
        window.Tawk_API = window.Tawk_API || {};

        window.Tawk_API.onChatMaximized = function () {
          setIsShow(false);
        };

        window.Tawk_API.onChatMinimized = function () {
          setIsShow(true);
        };

        window.Tawk_API.onLoad = function () {
          window.Tawk_API.hideWidget();
        };

        // Script loaded, but the widget API may not be ready yet.
        // Wait until maximize() is available (or time out).
        const start = Date.now();
        const timeoutMs = 8000;
        const tickMs = 100;

        const timer = window.setInterval(() => {
          const apiObj = window.Tawk_API;
          const ready = apiObj && typeof apiObj.maximize === "function";
          if (ready) {
            window.clearInterval(timer);
            resolve();
            return;
          }

          if (Date.now() - start > timeoutMs) {
            window.clearInterval(timer);
            loadPromiseRef.current = null;
            reject(new Error("Tawk widget did not initialize (maximize unavailable)."));
          }
        }, tickMs);
      };

      script.onerror = () => {
        loadPromiseRef.current = null;
        tawkLoadedRef.current = false;
        console.error("Failed to load Tawk embed script:", script.src);
        reject(new Error("Failed to load chat widget script."));
      };

      document.body.appendChild(script);
    });

    return loadPromiseRef.current;
  };

  useEffect(() => {
    if (window.Tawk_API && window.Tawk_API.setAttributes && userData?.id) {
      window.Tawk_API.setAttributes(
        {
          name: userData.userName,
          email: userData.email,
          userId: userData.id,
        },
        function (error) {
          if (error) console.error(error);
        },
      );
    }
  }, [userData]);

  const openChat = async () => {
    try {
      await loadTawk();
      if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
        window.Tawk_API.maximize();
        return;
      }
      setIsShow(true);
      throw new Error("Chat widget is not ready yet.");
    } catch (e) {
      console.error(e);
      showErrorToast(e?.message || "Chat is not available right now.");
    }
  };

  const openWhatsApp = () => {
    const phoneNumber = config.mobileNo;
    if (!phoneNumber) {
      showErrorToast("WhatsApp number not configured.");
      return;
    }
    const message = "Hi, I need help with a course";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-8 md:right-2 right-3 z-50 flex flex-col space-y-4">
      {config.whatsappEnabled ? (
        <div
          onClick={openWhatsApp}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openWhatsApp()}
          className="bg-[#25d366] rounded-full text-white h-14 flex md:space-x-4 capitalize font-medium justify-center items-center py-1 text-lg w-12 px-3 md:w-auto"
          aria-label="Open WhatsApp"
        >
          <i className="ri-whatsapp-line text-3xl"></i>
        </div>
      ) : null}

      {isShow && config.talkToEnabled ? (
        <div
          onClick={openChat}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openChat()}
          className="bg-red-500 rounded-full text-white h-14 flex md:space-x-4 capitalize font-medium justify-center items-center py-1 text-lg w-12 md:w-auto px-3"
          aria-label="Open live chat"
        >
          <i className="ri-customer-service-2-fill text-3xl"></i>
        </div>
      ) : null}
    </div>
  );
}

