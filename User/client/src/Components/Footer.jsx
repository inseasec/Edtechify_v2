import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import menus from "../menu";

function getImageUrl(path, baseUrl) {
  if (!path) return "";
  const base = String(baseUrl || "").replace(/\/$/, "");
  const p = String(path).replace(/^\/+/, "");
  if (!base) return `/${p}`;
  return `${base}/${p}`;
}

export default function Footer() {
  const userApiBaseUrl = window._CONFIG_.VITE_API_BASE_URL;
  const adminApiBaseUrl = window._CONFIG_.VITE_ADMIN_PROJECT_URL;

  const { data: organisation, status } = useQuery({
    queryKey: ["organisation", "details"],
    queryFn: async () => {
      const token = localStorage.getItem("authToken");
      const base = adminApiBaseUrl || userApiBaseUrl;
      const res = await axios.get(`${base}/organizations/details`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return res.data;
    },
    enabled: Boolean(adminApiBaseUrl || userApiBaseUrl),
    staleTime: 30_000,
  });

  if (status === "pending" || !organisation) {
    return (
      <div className="bg-[#1a1a1a] py-4 text-white text-center">Loading...</div>
    );
  }

  return (
    <div className="bg-[#1a1a1a]">
      <div className="w-full max-w-[1300px] mx-auto py-2 flex flex-col md:flex-row justify-around text-white">
        <div className="mt-8 md:mt-8 md:w-[20%] flex justify-center">
          <Link to="/" aria-label="Home">
            {organisation.orgLogo ? (
              <img
                src={getImageUrl(organisation.orgLogo, adminApiBaseUrl || userApiBaseUrl)}
                alt="Organization logo"
                className="max-h-38 w-auto object-contain"
              />
            ) : null}
          </Link>
        </div>

        <div className="w-full md:mt-10 text-center md:text-start md:w-[21%]">
          <h3 className="text-2xl md:text-3xl">Contact Us</h3>

          <p className="mt-3 text-sm">
            <i className="ri-map-pin-fill h-2 text-center text-sm"> </i>
            {organisation.orgAddress}
          </p>

          <div className="flex mt-4 text-sm justify-center md:justify-start space-x-1">
            <i className="ri-phone-fill text-sm "></i>
            <p className="text-sm">{organisation.orgPhone}</p>
          </div>
          <div className="flex mt-4 text-sm justify-center md:justify-start space-x-1">
            <i className="ri-mail-fill text-sm"></i>
            <p className="text-sm">{organisation.orgEmail}</p>
          </div>
        </div>

        <div className="w-full mt-10 md:mt-8 md:w-[20%]">
          <h3 className="text-2xl text-center md:text-start md:text-3xl">
            Quick Links
          </h3>
          <div className="mt-1 md:mt-3 text-md md:text-lg text-center md:text-start">
            {menus.map((item, index) => (
              <li className="list-none mt-1" key={index}>
                <Link to={item.mLink} className="hover:underline text-sm">
                  {item.mName}
                </Link>
              </li>
            ))}
          </div>
        </div>

        <div className="w-full mt-8 md:mt-10 md:w-[12%]">
          <h3 className="text-2xl text-white text-center md:text-start md:text-3xl">
            Follow Us
          </h3>
          <div className="flex justify-center space-x-4 md:justify-start mt-4">
            <i
              onClick={() =>
                window.open(
                  "https://www.facebook.com/profile.php?id=61554411563615",
                  "_blank",
                )
              }
              className="ri-facebook-fill border text-xl cursor-pointer md:text-2xl p-1 rounded-md border-white"
            ></i>
            <i
              onClick={() => window.open("https://www.instagram.com/rankwell.in", "_blank")}
              className="ri-instagram-line border cursor-pointer text-xl md:text-2xl p-1 rounded-md border-white"
            ></i>
            <i
              onClick={() => window.open("https://www.linkedin.com", "_blank")}
              className="ri-linkedin-fill border cursor-pointer text-xl md:text-2xl p-1 rounded-md border-white"
            ></i>
          </div>
        </div>
      </div>
    </div>
  );
}
