// src/components/Header.tsx

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogOut, UserCircle2 as UserIcon } from "lucide-react";
import codeNovaLogo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "./theme-provider";

interface NavItem {
  name: string;
  href: string;
  requiresAuth?: boolean;
}

const siteConfig = {
  name: "CodeNova",
  logo: codeNovaLogo,
};

const baseNavigation: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Program Overview", href: "/program-overview" },
  { name: "Courses", href: "/courses", requiresAuth: true },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser: user, logout } = useAuth();
  const isAuthenticated = !!user;
  const { theme } = useTheme(); // We still need the theme to apply dark mode classes

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredNavigation: NavItem[] = baseNavigation.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center gap-3">
            <img src={siteConfig.logo} alt={`${siteConfig.name} Logo`} className="h-8 w-auto" />
            <span className="font-bold text-xl text-slate-900 dark:text-slate-50 hidden sm:inline-block">
              {siteConfig.name}
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-x-6 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-sky-500 dark:hover:text-sky-400 ${
                pathname === item.href
                  ? "text-sky-500 dark:text-sky-400"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {item.name}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-sky-500 dark:hover:text-sky-400 ${
                pathname === "/dashboard"
                  ? "text-sky-500 dark:text-sky-400"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex-shrink-0 flex items-center gap-x-2 sm:gap-x-3 ml-auto">
          {/* THEME TOGGLE BUTTON HAS BEEN COMPLETELY REMOVED */}

          <div className="hidden sm:flex items-center gap-x-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile" title="My Profile">
                  <Button variant="ghost" size="icon" className="text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <UserIcon size={22} />
                    )}
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={handleLogout}>Log Out</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-700 dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-900 text-white font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="sm:hidden text-slate-700 dark:text-slate-300 p-2 -mr-2 rounded-md"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden py-4 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <nav className="flex flex-col space-y-2">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2 px-3 rounded-md text-base font-medium ${
                  pathname.startsWith(item.href) && item.href !== '/' || pathname === item.href
                    ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/50"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated && (
                <Link to="/dashboard" className={`block py-2 px-3 rounded-md text-base font-medium ${ pathname.startsWith("/dashboard") ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/50" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Dashboard</Link>
            )}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">My Profile</Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>Log Out</Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block w-full">
                    <Button variant="outline" className="w-full">Log In</Button>
                  </Link>
                  <Link to="/register" className="block w-full">
                    <Button className="w-full bg-slate-900 dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-900 text-white font-semibold">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}