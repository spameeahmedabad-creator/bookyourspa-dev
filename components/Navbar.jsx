"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  BookOpen,
  Bookmark,
  PlusCircle,
  Building2,
  MapPin,
  ChevronDown,
  Home,
  UserCog,
  Tag,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [spaCount, setSpaCount] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      const userData = response.data.user;
      setUser(userData);
      if (userData.role === "spa_owner") {
        try {
          const spasRes = await axios.get(
            `/api/spas?ownerId=${userData.id}&limit=1000`,
          );
          setSpaCount((spasRes.data.spas || []).length);
        } catch {
          setSpaCount(null);
        }
      } else {
        setSpaCount(null);
      }
    } catch {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const handleBookNow = () => {
    setShowMobileMenu(false);
    router.push("/?booking=true");
  };

  const handleCitySelect = (city) => {
    setShowCityDropdown(false);
    setShowMobileMenu(false);
    router.push(`/?city=${encodeURIComponent(city)}`);
    setTimeout(() => {
      document
        .getElementById("spa-listings")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showDropdown &&
        !e.target.closest('[data-testid="user-menu-button"]') &&
        !e.target.closest('[data-testid="user-dropdown"]')
      ) {
        setShowDropdown(false);
      }
      if (
        showCityDropdown &&
        !e.target.closest('[data-testid="city-menu-button"]') &&
        !e.target.closest('[data-testid="city-dropdown"]')
      ) {
        setShowCityDropdown(false);
      }
    };
    if (showDropdown || showCityDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown, showCityDropdown]);

  return (
    <>
      <nav
        className={`sticky top-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_24px_-4px_rgba(0,0,0,0.1)] border-b border-sand-100"
            : "bg-white/80 backdrop-blur-md border-b border-sand-100/60"
        }`}
        data-testid="main-navbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center group"
                data-testid="logo-link"
              >
                <img
                  src="/img/Your Spa.png"
                  alt="BookYourSpa Logo"
                  className="h-20 sm:h-22 md:h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                  data-testid="home-link"
                >
                  <Home className="w-3.5 h-3.5" />
                  Home
                </Link>

                {/* City dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCityDropdown(!showCityDropdown)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                    data-testid="city-menu-button"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Spa Near Me
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${showCityDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showCityDropdown && (
                    <div
                      className="absolute left-0 mt-2 w-44 bg-white rounded-2xl shadow-luxury border border-sand-100 py-1.5 z-[9999] animate-fadeSlideUp"
                      data-testid="city-dropdown"
                    >
                      {["Ahmedabad", "Gandhinagar"].map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCitySelect(city)}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors rounded-xl mx-auto flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Book Now CTA */}
              <Button
                onClick={handleBookNow}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs sm:text-sm px-3 sm:px-5 h-8 sm:h-9 rounded-xl shadow-luxury hover:shadow-luxury-lg transition-all duration-300 font-medium"
                data-testid="book-now-nav-button"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Book Now</span>
                <span className="sm:hidden">Book</span>
              </Button>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-sand-200 bg-sand-50 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200"
                    data-testid="user-menu-button"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="font-semibold text-xs text-gray-800">
                        {user.name.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-emerald-600 capitalize font-medium">
                        {user.role === "spa_owner" ? "Spa Owner" : user.role}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 hidden sm:block transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-luxury-lg border border-sand-100 py-2 z-[9999] animate-fadeSlideUp"
                      data-testid="user-dropdown"
                    >
                      {/* User info header */}
                      <div className="px-4 pb-2 mb-1 border-b border-sand-100">
                        <p className="font-semibold text-sm text-gray-800">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email || user.phone}
                        </p>
                      </div>

                      {[
                        {
                          href: "/",
                          icon: Home,
                          label: "Home",
                          testId: "home-dropdown-link",
                        },
                        {
                          href: "/dashboard/profile",
                          icon: UserCog,
                          label: "My Profile",
                          testId: "profile-link",
                        },
                      ].map(({ href, icon: Icon, label, testId }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                          data-testid={testId}
                          onClick={() => setShowDropdown(false)}
                        >
                          <Icon className="w-4 h-4 mr-3 text-gray-400" />
                          {label}
                        </Link>
                      ))}

                      <div className="my-1 border-t border-sand-100" />

                      <Link
                        href="/dashboard/bookings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                        data-testid="my-bookings-link"
                        onClick={() => setShowDropdown(false)}
                      >
                        <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
                        My Bookings
                      </Link>

                      {user.role === "spa_owner" && (
                        <Link
                          href="/dashboard/spas"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                          My Spas
                          {typeof spaCount === "number" && (
                            <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                              {spaCount}
                            </span>
                          )}
                        </Link>
                      )}

                      {(user.role === "spa_owner" || user.role === "admin") && (
                        <Link
                          href="/dashboard/coupons"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                          onClick={() => setShowDropdown(false)}
                        >
                          <Tag className="w-4 h-4 mr-3 text-gray-400" />
                          Coupons
                        </Link>
                      )}

                      {user.role === "admin" && (
                        <>
                          <Link
                            href="/dashboard/admin/users"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                            data-testid="manage-users-link"
                            onClick={() => setShowDropdown(false)}
                          >
                            <UserCog className="w-4 h-4 mr-3 text-gray-400" />
                            Manage Users
                          </Link>
                          <Link
                            href="/dashboard/admin/spas"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                            data-testid="manage-spas-link"
                            onClick={() => setShowDropdown(false)}
                          >
                            <Building2 className="w-4 h-4 mr-3 text-gray-400" />
                            Manage Spas
                          </Link>
                          <Link
                            href="/dashboard/add-listing"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                            data-testid="add-listing-link"
                            onClick={() => setShowDropdown(false)}
                          >
                            <PlusCircle className="w-4 h-4 mr-3 text-gray-400" />
                            Add Listing
                          </Link>
                        </>
                      )}

                      <Link
                        href="/dashboard/bookmarks"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-sand-50 hover:text-emerald-700 transition-colors"
                        data-testid="bookmarks-link"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Bookmark className="w-4 h-4 mr-3 text-gray-400" />
                        Bookmarks
                      </Link>

                      <div className="my-1 border-t border-sand-100" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-2xl"
                        data-testid="logout-button"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9 rounded-xl border-sand-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                    data-testid="login-button"
                  >
                    <User className="w-3.5 h-3.5 mr-1.5" />
                    Login
                  </Button>
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-sand-100 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-sand-100 bg-white/95 backdrop-blur-xl animate-fadeSlideUp">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                <Home className="w-4 h-4" /> Home
              </Link>
              <button
                onClick={() => handleCitySelect("Ahmedabad")}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left"
              >
                <MapPin className="w-4 h-4" /> Spas in Ahmedabad
              </button>
              <button
                onClick={() => handleCitySelect("Gandhinagar")}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors w-full text-left"
              >
                <MapPin className="w-4 h-4" /> Spas in Gandhinagar
              </button>
              <button
                onClick={handleBookNow}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 w-full transition-all duration-200 mt-2"
              >
                <Sparkles className="w-4 h-4" /> Book Now
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
