import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AccountPanel from "../Components/AccountPanel";
import Settings from "../Components/Settings";
import ChangePassword from "../Components/ChangePassword";
import TermAndCondition from "../Components/TermAndCondition";
import BillingInvoices from "../Components/BillingInvoices";
import ConfirmPaymentPage from "../Components/ConfirmPaymentPage";

function MyAccount() {
  const { component } = useParams();
  const [activeComponent, setActiveComponent] = useState(component || "account");
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (component) {
      setActiveComponent(component);
    }
  }, [component]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "account":
        return <AccountPanel />;
      case "settings":
        return <Settings />;
      case "changepassword":
        return <ChangePassword />;
      case "termsandcondition":
        return <TermAndCondition />;
      case "invoices":
        return <BillingInvoices />;
      case "buynow":
        return <ConfirmPaymentPage />;
      default:
        return <AccountPanel />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const getItemClass = (componentName) =>
    activeComponent === componentName ? "text-orange-600 font-semibold" : "text-gray-700";

  const handleMenuClick = (name) => {
    navigate(`/account/${name}`);
  };

  const mobileItem = (name, icon, label) => (
    <li
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && (handleMenuClick(name), setIsActive(false))}
      onClick={() => {
        handleMenuClick(name);
        setIsActive(false);
      }}
      className={`text-sm cursor-pointer ${getItemClass(name)}`}
    >
      <i className={`${icon} text-xl`}></i> <span className="ml-3">{label}</span>
    </li>
  );

  const desktopItem = (name, icon, label) => (
    <li
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleMenuClick(name)}
      onClick={() => handleMenuClick(name)}
      className={`text-sm cursor-pointer ${getItemClass(name)}`}
    >
      <i className={`${icon} text-xl`}></i>
      <span className="ml-3">{label}</span>
    </li>
  );

  return (
    <div className="w-full max-w-none">
      <div className="flex relative w-full flex-col md:flex-row md:min-h-[min(70vh,720px)]">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className="md:hidden bg-transparent border-0 p-3 text-left w-full text-gray-800 border-b border-slate-200"
          aria-label="Open account menu"
        >
          <i className="ri-menu-2-line text-xl" />
        </button>

        {isActive && (
          <div className="w-[min(100%,280px)] max-w-[85vw] absolute z-50 top-14 left-3 right-auto bg-slate-100 px-4 py-4 shadow-xl rounded-md md:hidden">
            <ul className="flex flex-col space-y-2">
              {mobileItem("account", "ri-user-settings-line", "Account")}
              {mobileItem("settings", "ri-settings-5-line", "Settings")}
              {mobileItem("buynow", "ri-shopping-bag-3-line", "Buy Now")}
              {mobileItem("invoices", "ri-bill-line", "Billing and Invoices")}
              {mobileItem("changepassword", "ri-rotate-lock-line", "Change Password")}
              {mobileItem("termsandcondition", "ri-shield-keyhole-line", "Terms and Conditions")}
              <li
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleLogout()}
                onClick={handleLogout}
                className="text-sm cursor-pointer"
              >
                <i className="ri-logout-circle-line text-xl"></i>
                <span className="ml-3">Logout</span>
              </li>
            </ul>
          </div>
        )}

        <div className="hidden md:flex md:w-72 lg:w-80 shrink-0 bg-slate-200 md:min-h-[480px] px-6 lg:px-8 py-6 border-r border-slate-300/60">
          <ul className="flex flex-col space-y-4">
            {desktopItem("account", "ri-user-settings-line", "Account")}
            {desktopItem("settings", "ri-settings-5-line", "Settings")}
            {desktopItem("buynow", "ri-shopping-bag-3-line", "Buy Now")}
            {desktopItem("invoices", "ri-bill-line", "Billing and Invoices")}
            {desktopItem("changepassword", "ri-rotate-lock-line", "Change Password")}
            {desktopItem("termsandcondition", "ri-shield-keyhole-line", "Terms and Conditions")}
            <li
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleLogout()}
              onClick={handleLogout}
              className="text-sm cursor-pointer"
            >
              <i className="ri-logout-circle-line text-xl"></i>
              <span className="ml-3">Sign Out</span>
            </li>
          </ul>
        </div>

        <div className="relative w-full flex-1 min-w-0 text-gray-700 px-4 sm:px-6 lg:px-10 py-6 md:py-8 min-h-[320px]">
          {renderComponent()}
        </div>
      </div>

    </div>
  );
}

export default MyAccount;
