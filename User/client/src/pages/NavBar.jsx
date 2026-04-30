import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import parentCompany from "../assets/hero.png";
import menus from "../menu.js";
import axios from "axios";
import { decodeToken } from "../authConfig";
import "animate.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuDropDown, setMenuDropDown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user_ID, setUser_ID] = useState(null);
  const [userData, setUserData] = useState({});
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [orgLogo, setOrgLogo] = useState("");

  const desktopAccountRef = useRef(null);
  const mobileAccountRef = useRef(null);

  const baseUrl = window._CONFIG_.VITE_API_BASE_URL;
  const adminApiBaseUrl = window._CONFIG_.VITE_ADMIN_PROJECT_URL;

  const getImageUrl = (path, base) => {
    if (!path) return "";
    const cleanedBase = String(base || "").replace(/\/$/, "");
    const cleanedPath = String(path).replace(/^\/+/, "");
    if (!cleanedBase) return `/${cleanedPath}`;
    return `${cleanedBase}/${cleanedPath}`;
  };

  const refreshAuth = () => {
    const id = decodeToken();
    if (id == null || id === undefined) {
      setUser_ID(null);
      setIsLoggedIn(false);
      return;
    }
    const uid = typeof id === "number" ? id : Number(id);
    if (Number.isNaN(uid)) {
      setUser_ID(null);
      setIsLoggedIn(false);
      return;
    }
    setUser_ID(uid);
    setIsLoggedIn(true);
  };

  useEffect(() => {
    refreshAuth();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inDesktop = desktopAccountRef.current?.contains(e.target);
      const inMobile = mobileAccountRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) setIsAccountOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchOrganisation = async () => {
      const token = localStorage.getItem("authToken");
      const apiBase = adminApiBaseUrl || baseUrl;
      if (!apiBase) return;
      try {
        const res = await axios.get(`${apiBase}/organizations/details`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setOrgLogo(res.data?.orgLogo ?? "");
      } catch {
        setOrgLogo("");
      }
    };
    fetchOrganisation();
  }, [adminApiBaseUrl, baseUrl]);

  const userInfo = async () => {
    if (!user_ID) return;
    try {
      const response = await axios.get(`${baseUrl}/users/getUser/${user_ID}`);
      setUserData(response.data ?? {});
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (!user_ID) {
      setUserData({});
      return;
    }
    userInfo();
  }, [user_ID]);

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setUser_ID(null);
    setUserData({});
    setIsAccountOpen(false);
    navigate("/");
  };

  const profileImageSrc = () => {
    if (!userData?.userImg) return null;
    const path = String(userData.userImg).replace(/^\/+/, "");
    return `${baseUrl}/${path}`;
  };

  const AccountDropdown = ({ className = "" }) => (
    <div
      className={`absolute right-0 mt-3 z-50 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-3 animate__animated animate__fadeIn ${className}`}
    >
      <button
        type="button"
        onClick={() => {
          navigate("/account");
          setIsAccountOpen(false);
        }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
      >
        <i className="ri-user-3-line"></i>
        <span>My Account</span>
      </button>
      <button
        type="button"
        onClick={() => {
          handleSignOut();
        }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
      >
        <i className="ri-logout-circle-line"></i>
        <span>Sign Out</span>
      </button>
    </div>
  );

  const ProfileAvatar = ({ containerRef }) => (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsAccountOpen((o) => !o)}
        className="rounded-full border-2 border-white bg-white focus:outline-none focus:ring-2 focus:ring-white/80"
        aria-expanded={isAccountOpen}
        aria-haspopup="true"
      >
        {profileImageSrc() ? (
          <img
            src={profileImageSrc()}
            alt="Profile"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center bg-orange-100">
            <i className="ri-user-3-line text-xl md:text-2xl text-orange-600"></i>
          </div>
        )}
      </button>
      {isAccountOpen && <AccountDropdown />}
    </div>
  );

  const brandLogoSrc = orgLogo ? getImageUrl(orgLogo, adminApiBaseUrl || baseUrl) : "Logo";

  return (
    <>
      <header className="hidden md:block bg-orange-500 shadow-md w-full">
        <div className="w-full max-w-none px-4 lg:px-8 h-24 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Link to="/" className="shrink-0 flex items-center">
              <img src={brandLogoSrc} alt="Home" className="h-16 w-auto max-w-[160px] object-contain" />
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 justify-center space-x-6 md:space-x-8 text-white text-[16px] font-medium">
            {menus.map((item, index) => (
              <Link key={index} to={item.mLink} className="hover:underline transition">
                {item.mName}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              type="button"
              className="bg-[#8F3C00] text-white flex items-center justify-center h-10 w-10 rounded-full hover:bg-[#7a3300] transition"
              aria-label="Wishlist"
            >
              <i className="ri-heart-2-fill text-xl"></i>
            </button>

            <div className="relative">
              {isLoggedIn ? (
                <ProfileAvatar containerRef={desktopAccountRef} />
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/signin")}
                    className="px-4 py-2 font-black text-[whitesmoke] border border-white rounded-md cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 bg-[whitesmoke] font-black text-orange-500 rounded-md cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="md:hidden bg-orange-500 text-white">
        <div className="flex justify-between items-center px-4 py-3 gap-2">
          <button
            type="button"
            onClick={() => setMenuDropDown(!menuDropDown)}
            className="ri-menu-line text-2xl cursor-pointer bg-transparent border-0 text-white p-0 shrink-0"
            aria-label="Menu"
          />

          <Link to="/" className="flex-1 flex justify-center min-w-0" onClick={() => setMenuDropDown(false)}>
            <img src={brandLogoSrc} alt="Home" className="h-10 w-auto max-h-10 object-contain" />
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            {isLoggedIn ? (
              <ProfileAvatar containerRef={mobileAccountRef} />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/signin")}
                  className="px-3 py-1.5 text-sm font-bold text-white border border-white rounded-md"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="px-3 py-1.5 text-sm font-bold text-orange-500 bg-white rounded-md"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {menuDropDown && (
          <div className="flex flex-col items-center space-y-3 pb-4 text-sm border-t border-orange-400/40 pt-3">
            {menus.map((item, index) => (
              <Link
                key={index}
                to={item.mLink}
                onClick={() => setMenuDropDown(false)}
                className="hover:underline transition"
              >
                {item.mName}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
