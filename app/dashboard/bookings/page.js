"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Search,
  IndianRupee,
  Tag,
  Receipt,
} from "lucide-react";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUserAndBookings();
  }, []);

  const fetchUserAndBookings = async () => {
    try {
      const [userRes, bookingsRes] = await Promise.all([
        axios.get("/api/auth/me"),
        axios.get("/api/bookings"),
      ]);

      setUser(userRes.data.user);
      const bookingsData = bookingsRes.data.bookings;
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookings(bookings);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = bookings.filter((booking) => {
      const spaName = booking.spaId?.title?.toLowerCase() || "";
      const customerName = booking.customerName?.toLowerCase() || "";
      const customerPhone = booking.customerPhone?.toLowerCase() || "";
      const service = booking.service?.toLowerCase() || "";
      const location =
        booking.spaId?.location?.region?.toLowerCase() ||
        booking.spaId?.location?.address?.toLowerCase() ||
        "";
      const date = booking.date
        ? format(new Date(booking.date), "MMM dd, yyyy").toLowerCase()
        : "";
      const status = booking.status?.toLowerCase() || "";

      return (
        spaName.includes(query) ||
        customerName.includes(query) ||
        customerPhone.includes(query) ||
        service.includes(query) ||
        location.includes(query) ||
        date.includes(query) ||
        status.includes(query)
      );
    });

    setFilteredBookings(filtered);
  }, [searchQuery, bookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if customer is trying to access (show restriction message)
  if (user && user.role === "customer" && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 text-lg">
                You don't have any bookings yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div
        className="max-w-7xl mx-auto px-4 py-4 sm:py-8"
        data-testid="bookings-page"
      >
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user?.role === "admin"
                ? "All Bookings"
                : user?.role === "spa_owner"
                  ? "My Spa Bookings"
                  : "My Bookings"}
            </h1>
            {bookings.length > 0 && (
              <div className="text-sm text-gray-600">
                Showing {filteredBookings.length} of {bookings.length} bookings
              </div>
            )}
          </div>

          {/* Search Bar */}
          {bookings.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <Input
                type="text"
                placeholder="Search by spa, customer, phone, service, location, date, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 pr-4 py-2 sm:py-3 w-full"
              />
            </div>
          )}
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 text-lg">No bookings found</p>
            </CardContent>
          </Card>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600 text-lg">
                No bookings found matching "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Clear search
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking._id} data-testid={`booking-${booking._id}`}>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Spa</p>
                      <p className="font-semibold text-gray-900">
                        {booking.snapshot?.spaName ||
                          booking.spaId?.title ||
                          "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Customer</p>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {booking.customerName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {booking.customerPhone}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Service</p>
                      <p className="font-medium text-gray-900">
                        {booking.snapshot?.serviceDetails?.title ||
                          booking.service}
                      </p>
                      {booking.snapshot?.serviceDetails?.duration && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.snapshot.serviceDetails.duration}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Date & Time</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {format(new Date(booking.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {booking.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  {(booking.originalAmount > 0 || booking.finalAmount > 0) && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-2">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Service Price
                            </p>
                            <p className="font-medium text-gray-900">
                              ₹
                              {(
                                booking.originalAmount ||
                                booking.snapshot?.serviceDetails?.price ||
                                0
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {booking.couponCode && booking.discountAmount > 0 && (
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-xs text-gray-500">
                                Discount ({booking.couponCode})
                              </p>
                              <p className="font-medium text-emerald-600">
                                -₹{booking.discountAmount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <IndianRupee className="w-4 h-4 text-emerald-600" />
                          <div>
                            <p className="text-xs text-gray-500">Total Price</p>
                            <p className="font-semibold text-emerald-600">
                              ₹{(booking.finalAmount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Status for Partial Payments */}
                      {booking.paymentStatus === "partial" && booking.pendingAmount > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <div>
                                <p className="text-xs text-gray-500">Paid</p>
                                <p className="font-medium text-emerald-600">
                                  ₹{(booking.paidAmount || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                              <div>
                                <p className="text-xs text-gray-500">Pay at Spa</p>
                                <p className="font-medium text-gray-900">
                                  ₹{(booking.pendingAmount || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">
                        {booking.snapshot?.spaLocation?.region ||
                          booking.snapshot?.spaLocation?.address ||
                          booking.spaId?.location?.region ||
                          booking.spaId?.location?.address}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Payment Status Badge */}
                      {booking.paymentStatus && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : booking.paymentStatus === "partial"
                                ? "bg-amber-100 text-amber-700"
                                : booking.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : booking.paymentStatus === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.paymentStatus === "paid"
                            ? "Fully Paid"
                            : booking.paymentStatus === "partial"
                              ? "Booking Fee Paid"
                              : booking.paymentStatus === "pending"
                                ? "Payment Pending"
                                : booking.paymentStatus === "failed"
                                  ? "Payment Failed"
                                  : booking.paymentStatus}
                        </span>
                      )}
                      {/* Booking Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
