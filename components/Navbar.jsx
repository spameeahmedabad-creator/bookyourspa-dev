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
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data.user);
    } catch (error) {
      // User not logged in
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleBookNow = () => {
    router.push("/?booking=true");
  };

  return (
    <nav
      className="bg-white shadow-md sticky top-0 z-40"
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Home */}
          <div className="flex items-center space-x-3 sm:space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-2"
              data-testid="logo-link"
            >
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                BookYourSpa
              </div>
            </Link>
            <Link
              href="/"
              className="hidden sm:block text-gray-700 hover:text-emerald-600 font-medium transition-colors"
              data-testid="home-link"
            >
              Home
            </Link>
          </div>

          {/* Right Side - Book Now & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              onClick={handleBookNow}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
              data-testid="book-now-nav-button"
            >
              <span className="hidden sm:inline">Book Now</span>
              <span className="sm:hidden">Book</span>
            </Button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-emerald-600 transition-colors"
                  data-testid="user-menu-button"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm sm:text-base hidden sm:inline">
                      {user.name}
                    </span>
                    <span className="font-medium text-sm sm:hidden">
                      {user.name.split(" ")[0]}
                    </span>
                    <span className="text-xs text-emerald-600 capitalize hidden sm:inline">
                      {user.role === "spa_owner" ? "Spa Owner" : user.role}
                    </span>
                  </div>
                </button>

                {showDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border py-2 z-50"
                    data-testid="user-dropdown"
                  >
                    <Link
                      href="/dashboard/bookings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      data-testid="my-bookings-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <BookOpen className="w-4 h-4 mr-3" />
                      My Bookings
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/dashboard/admin/users"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        data-testid="manage-users-link"
                        onClick={() => setShowDropdown(false)}
                      >
                        <svg
                          className="w-4 h-4 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Manage Users
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link
                        href="/dashboard/admin/spas"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        data-testid="manage-spas-link"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Building2 className="w-4 h-4 mr-3" />
                        Manage Spas
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link
                        href="/dashboard/add-listing"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                        data-testid="add-listing-link"
                        onClick={() => setShowDropdown(false)}
                      >
                        <PlusCircle className="w-4 h-4 mr-3" />
                        Add Listing
                      </Link>
                    )}
                    <Link
                      href="/dashboard/bookmarks"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      data-testid="bookmarks-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Bookmark className="w-4 h-4 mr-3" />
                      Bookmarks
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
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
                  className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
                  data-testid="login-button"
                >
                  <User className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
