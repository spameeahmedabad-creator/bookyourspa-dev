'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { User, LogOut, BookOpen, Bookmark, MessageSquare, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      // User not logged in
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleBookNow = () => {
    router.push('/?booking=true');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo and Home */}
          <div className="flex items-center space-x-3 sm:space-x-8">
            <Link href="/" className="flex items-center space-x-2" data-testid="logo-link">
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
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="book-now-nav-button"
            >
              Book Now
            </Button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-colors"
                  data-testid="user-menu-button"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2" data-testid="user-dropdown">
                    <Link
                      href="/dashboard/bookings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      data-testid="my-bookings-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <BookOpen className="w-4 h-4 mr-3" />
                      My Bookings
                    </Link>
                    {(user.role === 'admin' || user.role === 'spa_owner') && (
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
                    <Link
                      href="/dashboard/messages"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      data-testid="messages-link"
                      onClick={() => setShowDropdown(false)}
                    >
                      <MessageSquare className="w-4 h-4 mr-3" />
                      Messages
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
                <Button variant="outline" data-testid="login-button">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
