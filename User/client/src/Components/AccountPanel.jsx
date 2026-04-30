import React, { useEffect, useRef, useState, useCallback } from "react";
import { decodeToken } from "../authConfig";
import axios from "axios";
import EditUser from "./EditUser";
import EditInfo from "./EditInfo";
import UserImagePopUp from "./UserImagePopUp";
import api from "../api";
import ProgressBar from "../utils/ProgressBar";
import { showErrorToast, showSuccessToast } from "../utils/toastUtils";

function accountImageUrl(userImg, baseUrl) {
  if (!userImg) return null;
  // If backend already returns an absolute URL, use it as-is.
  if (/^https?:\/\//i.test(String(userImg))) return String(userImg);
  const p = String(userImg).replaceAll("\\", "/").replace(/^\/+/, "");
  const trimmedBase = String(baseUrl || "").replace(/\/+$/, "");
  if (!trimmedBase) return null;
  // Encode each segment so emails/spaces don't break the URL.
  const encodedPath = p
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${trimmedBase}/${encodedPath}`;
}

export default function AccountPanel() {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [openImagePopUp, setOpenImagePopUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileImgBroken, setIsProfileImgBroken] = useState(false);
  const fileInputRef = useRef(null);

  const user_ID = decodeToken();
  const baseUrl = window._CONFIG_.VITE_API_BASE_URL;
  const mediaBaseUrl = window._CONFIG_.VITE_MEDIA_BASE_URL || baseUrl;

  const userInfo = useCallback(async () => {
    if (user_ID == null) return;
    try {
      const response = await api.get(`/users/getUser/${user_ID}`);
      setUserData(response.data ?? {});
    } catch (error) {
      console.error("Error fetching user data:", error);
      showErrorToast(error?.response?.data || "Could not load profile");
    }
  }, [user_ID]);

  useEffect(() => {
    userInfo();
  }, [userInfo]);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file && user_ID != null) uploadImage(user_ID, file);
    // allow re-selecting the same file
    if (e.target) e.target.value = "";
  };

  const uploadImage = async (UserId, file) => {
    setIsUploading(true);
    setProgress(20);
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setProgress(50);
      await axios.put(`${baseUrl}/users/uploadImage/${UserId}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setProgress(100);
      showSuccessToast("Image uploaded successfully");
      await userInfo();
    } catch (error) {
      showErrorToast(error.response?.data || error.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const closeInfo = async () => {
    await userInfo();
    setIsEditing(false);
  };

  const handleCloseModal = async () => {
    setIsModalOpen(false);
    await userInfo();
  };

  const capitalizeFirstLetter = (string) => {
    if (!string || typeof string !== "string") return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const profileImgSrc = isProfileImgBroken
    ? null
    : accountImageUrl(userData.userImg, baseUrl) || accountImageUrl(userData.userImg, mediaBaseUrl);

  if (user_ID == null) {
    return (
      <p className="text-slate-600">Please sign in to view your profile.</p>
    );
  }

  return (
    <div>
      {isUploading && (
        <ProgressBar progress={progress} text="Uploading image…" isUploading={isUploading} />
      )}

      {isEditing ? (
        <EditInfo onClose={closeInfo} initialData={userData} />
      ) : (
        <div>
          <p className="text-3xl font-bold text-slate-500">Profile</p>
          <div className="flex bg-orange-500 px-2 rounded-md relative right-5 md:right-14 md:top-16 top-14 float-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-lg z-20 md:text-lg text-white cursor-pointer bg-transparent border-0 p-0"
              aria-label="Edit profile"
            >
              <i className="ri-edit-box-line" />
            </button>
          </div>

          <div className="flex flex-col w-full bg-slate-100 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl p-10 shadow-xl md:flex-row md:space-x-32 clear-both">
            <div className="flex flex-col md:flex-row md:space-x-10">
              <div className="w-32 h-32 md:order-0 mx-auto md:mx-0 relative">
                {profileImgSrc ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenImagePopUp(true)}
                      className="block w-32 h-32 rounded-full overflow-hidden bg-slate-200 border-0 p-0 cursor-pointer"
                      aria-label="View profile image"
                    >
                      <img
                        src={profileImgSrc}
                        alt="Profile"
                        onError={() => setIsProfileImgBroken(true)}
                        className="bg-slate-200 h-32 w-32 object-cover rounded-full"
                      />
                    </button>
                    <input
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImage}
                      type="file"
                      accept="image/*"
                    />

                    <div className="absolute bottom-2 right-2 z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="w-8 h-8 grid place-items-center mt-[-140px] rounded-full shadow bg-orange-500 text-white border-2 border-white"
                        aria-label="Update profile image"
                      >
                        <i className="ri-camera-line text-lg" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer"
                      onChange={handleImage}
                      type="file"
                      accept="image/*"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full h-full cursor-pointer bg-slate-200 rounded-full"
                    >
                      <div className="bg-orange-500 px-3 py-2 rounded-full">
                        <i className="text-lg text-white ri-camera-line" />
                      </div>
                    </label>
                  </>
                )}
              </div>
              <div className="flex flex-col md:order-2 justify-center items-center ml-[40px] md:items-start">
                <div className="flex mt-4 md:mt-0 items-center md:space-x-20 space-x-4">
                  <h3 className="text-sm md:text-lg text-[#f36a22] font-semibold">
                    {userData.userName || "—"}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-phone-fill text-lg md:text-lg hover:text-indigo-700 cursor-pointer" />
                  <p>{userData.mobileNo || "—"}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-mail-fill hover:text-indigo-700 cursor-pointer text-lg md:text-lg" />
                  <p>{userData.email || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 w-full bg-slate-100 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl py-7">
            <div className="relative flex justify-between px-14">
              <div className="absolute right-[70px] bg-orange-500 h-7 flex items-center px-2 py-3 rounded-md">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-lg md:text-lg text-white cursor-pointer bg-transparent border-0 p-0"
                  aria-label="Edit address"
                >
                  <i className="ri-edit-box-line" />
                </button>
              </div>
            </div>
            <div className="px-14 mt-4">
              <p className="text-orange-500 text-lg font-semibold">ADDRESS</p>
              <p className="mt-1">
                {userData.streetAddress ? (
                  <>
                    <span className="block">{userData.streetAddress}</span>
                    <span className="block">
                      {capitalizeFirstLetter(userData.city)}, {capitalizeFirstLetter(userData.state)}.{" "}
                      {userData.postalCode}
                      <br />
                      {userData.country}
                    </span>
                  </>
                ) : (
                  "Use Edit to add your address."
                )}
              </p>
            </div>
          </div>

          <EditUser isOpen={isModalOpen} isClose={handleCloseModal} refreshUser={userInfo} />
        </div>
      )}
      {openImagePopUp && profileImgSrc && (
        <UserImagePopUp onClose={() => setOpenImagePopUp(false)} src={profileImgSrc} />
      )}
    </div>
  );
}
