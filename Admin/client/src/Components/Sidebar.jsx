import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdminBasePath } from '@/hooks/useAdminBasePath';

const Icon = {
  Chevron: ({ className = 'h-3.5 w-3.5' }) => (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
        clipRule="evenodd"
      />
    </svg>
  ),
  Shield: ({ className = 'h-4 w-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5 20 6v6.3c0 5.2-3.4 9.4-8 10.7C7.4 21.7 4 17.5 4 12.3V6l8-3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.2 12.2 11.2 14.2 15.5 9.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Toggle: ({ className = 'h-4 w-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 7h8a5 5 0 0 1 0 10H8A5 5 0 0 1 8 7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.5 12a2.5 2.5 0 1 0 0 .01V12Z" fill="currentColor" />
    </svg>
  ),
  Key: ({ className = 'h-4 w-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 10a4 4 0 1 0-2.3 3.63L14 16h3v-2h2v-2h2v-2h-5.2l-1.25-1.26A4 4 0 0 0 14 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  ),
}

const linkClasses = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm no-underline transition-colors ${
    isActive ? 'bg-white/10 text-white font-medium' : 'text-gray-300 hover:bg-white/5 hover:text-white'
  }`;

const subLinkClasses = ({ isActive }) =>
  `block rounded-md py-1.5 pl-3 pr-2 text-[13px] no-underline transition-colors ${
    isActive ? 'bg-white/10 text-white font-medium' : 'text-slate-400 hover:bg-white/5 hover:text-white'
  }`;

const Sidebar = () => {
  const base = useAdminBasePath();
  const location = useLocation();
  const [companyOpen, setCompanyOpen] = useState(() =>
    location.pathname.includes('/company-details'),
  );
  const [chatSupportOpen, setChatSupportOpen] = useState(() =>
    /\/chat-support|\/configuration/.test(location.pathname),
  );
  const [userPanelOpen, setUserPanelOpen] = useState(() =>
    location.pathname.includes('/user-panel'),
  );
  const [careersOpen, setCareersOpen] = useState(() => location.pathname.includes('/careers'));
  const [authOpen, setAuthOpen] = useState(() =>
    location.pathname.includes('/user-panel/authentication'),
  );

  useEffect(() => {
    if (location.pathname.includes('/company-details')) {
      setCompanyOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (/\/chat-support|\/configuration/.test(location.pathname)) {
      setChatSupportOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes('/user-panel')) {
      setUserPanelOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes('/user-panel/authentication')) {
      setAuthOpen(true);
    }
  }, [location.pathname]);

  const companyLinks = [
    // { to: `${base}/company-details/pages`, label: 'Pages Company Details' },
    { to: `${base}/company-details/account-settings`, label: 'Account Settings' },
    { to: `${base}/company-details/invoice-settings`, label: 'Invoice Settings' },
    { to: `${base}/company-details/all-invoices`, label: 'All Invoices' },
  ];

  const chatSupportLinks = [
    // { to: `${base}/configuration`, label: 'Configuration' },
    { to: `${base}/chat-support`, label: 'Chat config' },
  ];

  const userPanelLinks = [
    { to: `${base}/user-panel/home`, label: 'Home' },
    { to: `${base}/user-panel/about`, label: 'About Us' },
  ];

  const careerLinks = [
    // { to: `${base}/careers`, label: 'Career', end: true },
    { to: `${base}/careers/applied`, label: 'Applied' },
    { to: `${base}/careers/shortlisted`, label: 'Shortlisted' },
    { to: `${base}/careers/under-review`, label: 'Under Review' },
    { to: `${base}/careers/selected`, label: 'Selected' },
    { to: `${base}/careers/archived`, label: 'Archived' },
    { to: `${base}/careers/hr-applicants`, label: 'Hr Applicants' },
    { to: `${base}/careers/settings`, label: 'Settings' },
  ];

  const mainItems = [
    { to: `${base}/dashboard`, label: 'Dashboard' },
    { to: `${base}/admin`, label: 'Admin' },
    { to: `${base}/clients`, label: 'Clients' },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-slate-700/50 bg-slate-900 text-white">
      <div className="px-5 pt-2">
        <h3 className="text-sm font-semibold tracking-tight">Rankwell</h3>
        <p className="mt-1 text-xs text-slate-400">Admin</p>
      </div>
      <hr className="mx-4 my-4 border-slate-700" />
      <nav className="flex flex-1 flex-col gap-1 px-3 pb-6 overflow-y-auto">
        <details
          className="group rounded-md"
          open={companyOpen}
          onToggle={(e) => setCompanyOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 marker:hidden [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
            <span>Company Details</span>
            <span className="text-slate-500 transition-transform group-open:rotate-180">
              <Icon.Chevron />
            </span>
          </summary>
          <div className="ml-1 mt-1 border-l border-slate-600/80 pl-2 space-y-0.5 pb-1">
            {companyLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={subLinkClasses}>
                {label}
              </NavLink>
            ))}
          </div>
        </details>

        <details
          className="group rounded-md"
          open={userPanelOpen}
          onToggle={(e) => setUserPanelOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 marker:hidden [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
            <span>User Panel</span>
            <span className="text-slate-500 transition-transform group-open:rotate-180">
              <Icon.Chevron />
            </span>
          </summary>
          <div className="ml-1 mt-1 border-l border-slate-600/80 pl-2 space-y-0.5 pb-1">
            {/* <p className="px-3 pt-0.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              UI Customisation
            </p> */}
            {userPanelLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={subLinkClasses}>
                {label}
              </NavLink>
            ))}

            <details
              className="group rounded-md"
              open={authOpen}
              onToggle={(e) => setAuthOpen(e.currentTarget.open)}
            >
              <summary className="cursor-pointer list-none rounded-md py-1.5 pl-3 pr-2 text-[13px] font-medium text-slate-300 hover:bg-white/5 hover:text-white marker:hidden [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  {/* <Icon.Shield className="h-4 w-4 text-slate-300" /> */}
                  Authentication
                </span>
                <span className="text-slate-500 transition-transform group-open:rotate-180">
                  <Icon.Chevron className="h-3 w-3" />
                </span>
              </summary>
              <div className="ml-2 mt-1 border-l border-slate-700/80 pl-2 space-y-0.5 pb-1">
                <NavLink to={`${base}/user-panel/authentication/providers`} className={subLinkClasses}>
                  <span className="inline-flex items-center gap-2">
                    {/* <Icon.Toggle className="h-4 w-4 text-slate-400" /> */}
                    OTP Based
                  </span>
                </NavLink>
                <NavLink to={`${base}/user-panel/authentication/keys`} className={subLinkClasses}>
                  <span className="inline-flex items-center gap-2">
                    {/* <Icon.Key className="h-4 w-4 text-slate-400" /> */}
                    Social Providers
                  </span>
                </NavLink>
                <NavLink to={`${base}/user-panel/authentication/side-images`} className={subLinkClasses}>
                  <span className="inline-flex items-center gap-2">
                    SignIn / SignUp Image
                  </span>
                </NavLink>
              </div>
            </details>
          </div>
        </details>

        <details
          className="group rounded-md"
          open={careersOpen}
          onToggle={(e) => setCareersOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 marker:hidden [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
            <span>Career</span>
            <span className="text-slate-500 transition-transform group-open:rotate-180">
              <Icon.Chevron />
            </span>
          </summary>
          <div className="ml-1 mt-1 border-l border-slate-600/80 pl-2 space-y-0.5 pb-1">
            {careerLinks.map(({ to, label, end }) => (
              <NavLink key={to} to={to} className={subLinkClasses} end={end === true}>
                {label}
              </NavLink>
            ))}
          </div>
        </details>

        {mainItems.map(({ to, label }) => (
          <NavLink key={to} to={to} className={linkClasses} end={label === 'Dashboard'}>
            {label}
          </NavLink>
        ))}

        <details
          className="group rounded-md"
          open={chatSupportOpen}
          onToggle={(e) => setChatSupportOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/5 marker:hidden [&::-webkit-details-marker]:hidden flex items-center justify-between gap-2">
            <span>Chat Support</span>
            <span className="text-slate-500 transition-transform group-open:rotate-180">
              <Icon.Chevron />
            </span>
          </summary>
          <div className="ml-1 mt-1 border-l border-slate-600/80 pl-2 space-y-0.5 pb-1">
            {chatSupportLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={subLinkClasses}>
                {label}
              </NavLink>
            ))}
          </div>
        </details>
      </nav>
    </aside>
  );
};

export default Sidebar;
