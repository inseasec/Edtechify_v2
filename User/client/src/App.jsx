import React from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./pages/NavBar";
import Footer from "./Components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Career from "./pages/Career";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyAccount from "./pages/MyAccount";
import ChatSupport from "./Components/ChatSupport";
import ForgotPassword from "./pages/ForgotPassword";

function MainLayout() {
  return (
    <div className="overflow-hidden m-0 p-0 min-h-screen flex flex-col">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ChatSupport />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/career" element={<Career />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<Navigate to="/account/account" replace />} />
          <Route path="/account/:component" element={<MyAccount />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Routes>
    </>
  );
}
