"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import { toast } from "sonner";
import axios from "axios";
import { validatePhone10Digits } from "@/lib/phone-validation";
import Link from "next/link";
import Script from "next/script";

// GST rate for display (18%)
const GST_RATE = 0.18;

export default function BookingModal({ open, onClose, prefilledSpa = null }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    spaId: "",
    spaName: "",
    service: "",
    datetime: "",
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [spas, setSpas] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedSpaData, setSelectedSpaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentType, setPaymentType] = useState("full"); // "full" or "booking_only"

  // Track if modal was previously open to only reset on open transition
  const wasOpenRef = useRef(false);

  // Check if Razorpay is already loaded (e.g., from another component instance)
  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Only reset form when modal transitions from closed to open
    if (open && !wasOpenRef.current) {
      fetchUser();
      if (!prefilledSpa) {
        fetchSpas();
      }
      // Reset form when modal opens
      setDate("");
      setTime("");
      setPhoneError("");
      setAcceptedTerms(false);
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError("");
      setPaymentProcessing(false);
      setPaymentType("full");

      // Also check if Razorpay was loaded while modal was closed
      if (typeof window !== "undefined" && window.Razorpay) {
        setRazorpayLoaded(true);
      }
    }
    wasOpenRef.current = open;
  }, [open, prefilledSpa]);

  useEffect(() => {
    const fetchFullSpaDetails = async () => {
      if (prefilledSpa) {
        // Set basic data immediately
        setFormData((prev) => ({
          ...prev,
          spaId: prefilledSpa._id,
          spaName: prefilledSpa.title,
        }));
        setServices(prefilledSpa.services || []);

        // Fetch full spa details including pricing
        try {
          const response = await axios.get(`/api/spas/${prefilledSpa._id}`);
          const fullSpaData = response.data.spa;
          setSelectedSpaData(fullSpaData);
          setServices(fullSpaData.services || []);
        } catch (error) {
          console.error("Failed to fetch full spa details:", error);
          // Fallback to prefilledSpa data if API call fails
          setSelectedSpaData(prefilledSpa);
        }
      }
    };

    fetchFullSpaDetails();
  }, [prefilledSpa]);

  // Validate time against store hours
  const validateBookingTime = (selectedDate, selectedTime) => {
    if (!selectedSpaData || !selectedDate || !selectedTime) {
      setTimeError("");
      return true;
    }

    const bookingDate = new Date(selectedDate);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday

    // Check if booking is on Sunday and spa is closed on Sunday
    if (dayOfWeek === 0 && selectedSpaData.storeHours?.sundayClosed) {
      setTimeError("This spa is closed on Sundays. Please select another day.");
      return false;
    }

    // Skip time validation if spa is open 24 hours
    if (selectedSpaData.storeHours?.is24Hours) {
      setTimeError("");
      return true;
    }

    // Validate time is within store hours
    if (
      selectedSpaData.storeHours?.openingTime &&
      selectedSpaData.storeHours?.closingTime
    ) {
      const openingTime = selectedSpaData.storeHours.openingTime;
      const closingTime = selectedSpaData.storeHours.closingTime;

      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const openingMinutes = timeToMinutes(openingTime);
      const closingMinutes = timeToMinutes(closingTime);
      const bookingMinutes = timeToMinutes(selectedTime);

      if (bookingMinutes < openingMinutes || bookingMinutes >= closingMinutes) {
        setTimeError(
          `Booking time must be between ${openingTime} and ${closingTime}. This spa is open from ${openingTime} to ${closingTime}.`
        );
        return false;
      }
    }

    setTimeError("");
    return true;
  };

  // Update datetime when date or time changes
  useEffect(() => {
    if (date && time) {
      const datetimeString = `${date}T${time}`;
      setFormData((prev) => ({ ...prev, datetime: datetimeString }));
      // Validate time
      validateBookingTime(date, time);
    } else {
      setFormData((prev) => ({ ...prev, datetime: "" }));
      setTimeError("");
    }
  }, [date, time, selectedSpaData]);

  // Reset coupon when service changes
  useEffect(() => {
    if (formData.service) {
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError("");
    }
  }, [formData.service]);

  // Re-validate coupon when date changes (if coupon is already applied)
  useEffect(() => {
    if (appliedCoupon && date) {
      const coupon = appliedCoupon.coupon;
      const bookingDate = new Date(date);
      bookingDate.setHours(0, 0, 0, 0);

      let isValid = true;
      let errorMessage = "";

      if (coupon.startDate) {
        const couponStartDate = new Date(coupon.startDate);
        couponStartDate.setHours(0, 0, 0, 0);
        if (bookingDate < couponStartDate) {
          isValid = false;
          errorMessage = `Coupon "${coupon.code}" is only valid from ${new Date(coupon.startDate).toLocaleDateString()}. Coupon removed.`;
        }
      }

      if (isValid && coupon.endDate) {
        const couponEndDate = new Date(coupon.endDate);
        couponEndDate.setHours(23, 59, 59, 999);
        if (bookingDate > couponEndDate) {
          isValid = false;
          errorMessage = `Coupon "${coupon.code}" expired on ${new Date(coupon.endDate).toLocaleDateString()}. Coupon removed.`;
        }
      }

      if (!isValid) {
        setAppliedCoupon(null);
        setCouponError(errorMessage);
        toast.error(errorMessage);
      }
    }
  }, [date]);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      const userData = response.data.user;
      setUser(userData);
      // Strip non-digits from phone number if it exists
      const phoneDigits = userData.phone
        ? userData.phone.replace(/\D/g, "").substring(0, 10)
        : "";
      setFormData((prev) => ({
        ...prev,
        customerName: userData.name,
        customerPhone: phoneDigits,
        customerEmail: userData.email || "",
      }));
    } catch (error) {
      setUser(null);
    }
  };

  const fetchSpas = async () => {
    try {
      const response = await axios.get("/api/spas?limit=100");
      setSpas(response.data.spas);
    } catch (error) {
      console.error("Failed to fetch spas:", error);
    }
  };

  const handleSpaChange = async (selectedOption) => {
    if (selectedOption) {
      const selectedSpa = spas.find((s) => s._id === selectedOption.value);
      if (selectedSpa) {
        // Fetch full spa details including store hours
        try {
          const response = await axios.get(`/api/spas/${selectedSpa._id}`);
          const fullSpaData = response.data.spa;
          setSelectedSpaData(fullSpaData);
          setFormData((prev) => ({
            ...prev,
            spaId: fullSpaData._id,
            spaName: fullSpaData.title,
            service: "",
          }));
          setServices(fullSpaData.services || []);
        } catch (error) {
          console.error("Failed to fetch spa details:", error);
          // Fallback to basic data
          setSelectedSpaData(selectedSpa);
          setFormData((prev) => ({
            ...prev,
            spaId: selectedSpa._id,
            spaName: selectedSpa.title,
            service: "",
          }));
          setServices(selectedSpa.services || []);
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        spaId: "",
        spaName: "",
        service: "",
      }));
      setServices([]);
      setSelectedSpaData(null);
      setTimeError("");
    }
  };

  const handleServiceChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({ ...prev, service: selectedOption.value }));
    } else {
      setFormData((prev) => ({ ...prev, service: "" }));
    }
  };

  // Transform spas to react-select format
  const spaOptions = spas.map((spa) => ({
    value: spa._id,
    label: spa.title,
  }));

  // If prefilledSpa is provided, add it to options if not already present
  const allSpaOptions =
    prefilledSpa && !spaOptions.find((opt) => opt.value === prefilledSpa._id)
      ? [{ value: prefilledSpa._id, label: prefilledSpa.title }, ...spaOptions]
      : spaOptions;

  // Transform pricing array to react-select format
  // Directly use pricing items which have title and price
  const serviceOptions =
    selectedSpaData?.pricing && Array.isArray(selectedSpaData.pricing)
      ? selectedSpaData.pricing
          .filter((item) => item.title && item.price !== undefined)
          .map((item) => {
            // Format price with currency symbol (₹ for Indian Rupees)
            const formattedPrice = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(item.price);

            return {
              value: item.title,
              label: `${item.title} - ${formattedPrice}`,
            };
          })
      : [];

  // Get selected spa option
  const selectedSpaOption = allSpaOptions.find(
    (option) => option.value === formData.spaId
  );

  // Get selected service option
  const selectedServiceOption = serviceOptions.find(
    (option) => option.value === formData.service
  );

  // Get selected service price
  const selectedServicePrice =
    selectedSpaData?.pricing?.find((p) => p.title === formData.service)
      ?.price || 0;

  // Calculate pricing with coupon and GST
  const originalAmount = selectedServicePrice;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const amountAfterDiscount = Math.max(0, originalAmount - discountAmount);
  // GST is included in the price
  const baseAmount =
    Math.round((amountAfterDiscount / (1 + GST_RATE)) * 100) / 100;
  const gstAmount = Math.round((amountAfterDiscount - baseAmount) * 100) / 100;
  const finalAmount = amountAfterDiscount;

  // Fixed booking fee
  const BOOKING_FEE = 199;

  // Calculate payment amounts based on payment type
  const paymentAmount = paymentType === "booking_only" ? BOOKING_FEE : finalAmount;
  const pendingAmount = paymentType === "booking_only" ? finalAmount - BOOKING_FEE : 0;

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!formData.spaId || !selectedServicePrice) {
      setCouponError("Please select a spa and service first");
      return;
    }

    // Check if booking date is selected
    if (!date) {
      setCouponError(
        "Please select a booking date first to validate the coupon"
      );
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const response = await axios.post("/api/coupons/validate", {
        code: couponCode.trim(),
        spaId: formData.spaId,
        orderAmount: selectedServicePrice,
      });

      if (response.data.valid) {
        const coupon = response.data.coupon;

        // Validate booking date against coupon's valid date range
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0); // Normalize to start of day

        if (coupon.startDate) {
          const couponStartDate = new Date(coupon.startDate);
          couponStartDate.setHours(0, 0, 0, 0);
          if (bookingDate < couponStartDate) {
            setCouponError(
              `This coupon is only valid from ${new Date(coupon.startDate).toLocaleDateString()}`
            );
            setAppliedCoupon(null);
            setValidatingCoupon(false);
            return;
          }
        }

        if (coupon.endDate) {
          const couponEndDate = new Date(coupon.endDate);
          couponEndDate.setHours(23, 59, 59, 999); // End of day
          if (bookingDate > couponEndDate) {
            setCouponError(
              `This coupon expired on ${new Date(coupon.endDate).toLocaleDateString()}. Please select a booking date within the coupon validity period.`
            );
            setAppliedCoupon(null);
            setValidatingCoupon(false);
            return;
          }
        }

        setAppliedCoupon(response.data);
        toast.success("Coupon applied successfully!");
      } else {
        setCouponError(response.data.reason || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError(
        error.response?.data?.reason || "Failed to validate coupon"
      );
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

  // Initialize Razorpay payment
  const initiatePayment = useCallback(
    async (orderData) => {
      if (!razorpayLoaded || !window.Razorpay) {
        toast.error("Payment system is loading. Please try again.");
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "BookYourSpa",
        description: `Booking at ${formData.spaName} - ${formData.service}`,
        order_id: orderData.order.id,
        prefill: orderData.prefill,
        theme: {
          color: "#10b981", // Emerald color
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: orderData.booking.id,
            });

            if (verifyResponse.data.success) {
              toast.success(
                "🎉 Payment successful! Your booking is confirmed. Check your email and WhatsApp for details."
              );
              onClose();
              // Reset form
              setFormData({
                customerName: "",
                customerPhone: "",
                customerEmail: "",
                spaId: "",
                spaName: "",
                service: "",
                datetime: "",
              });
              setDate("");
              setTime("");
              setPhoneError("");
              setAcceptedTerms(false);
              setCouponCode("");
              setAppliedCoupon(null);
              setCouponError("");
            } else {
              toast.error(
                "Payment verification failed. Please contact support."
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error(
              error.response?.data?.error ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setPaymentProcessing(false);
            setLoading(false);
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        toast.error(
          response.error.description || "Payment failed. Please try again."
        );
        setPaymentProcessing(false);
        setLoading(false);
      });

      razorpay.open();
    },
    [razorpayLoaded, formData.spaName, formData.service, onClose]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.spaId ||
      !formData.service ||
      !formData.datetime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate phone number before submitting
    const phoneValidation = validatePhone10Digits(formData.customerPhone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      toast.error(phoneValidation.error);
      return;
    }

    // Validate booking time before submitting
    if (!validateBookingTime(date, time)) {
      toast.error(timeError);
      return;
    }

    // Validate terms and conditions acceptance
    if (!acceptedTerms) {
      toast.error(
        "Please accept the Terms & Conditions to proceed with booking"
      );
      return;
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error(
        "Payment system is loading. Please wait a moment and try again."
      );
      return;
    }

    setLoading(true);
    setPaymentProcessing(true);

    try {
      // Parse datetime to separate date and time for API compatibility
      const datetime = new Date(formData.datetime);
      const dateStr = datetime.toISOString().split("T")[0];
      const timeStr = datetime.toTimeString().split(" ")[0].slice(0, 5); // HH:MM format

      const bookingData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        spaId: formData.spaId,
        service: formData.service,
        date: dateStr,
        time: timeStr,
        couponCode: appliedCoupon?.coupon?.code || null,
        paymentType: paymentType,
      };

      // Create Razorpay order
      const response = await axios.post(
        "/api/payments/create-order",
        bookingData
      );

      if (response.data.success) {
        // Initiate Razorpay payment
        initiatePayment(response.data);
      } else {
        toast.error(response.data.error || "Failed to create payment order");
        setPaymentProcessing(false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(error.response?.data?.error || "Failed to initiate payment");
      setPaymentProcessing(false);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error("Failed to load Razorpay SDK");
          toast.error("Failed to load payment system");
        }}
      />

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onClose={onClose}
          className="max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto"
          data-testid="booking-modal"
        >
          <DialogHeader className="pt-2 sm:pt-0">
            <DialogTitle className="text-lg sm:text-xl">
              Book Your Spa Appointment
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="Enter your name"
                required
                disabled={paymentProcessing}
                data-testid="booking-name-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Remove all non-digit characters
                  const digitsOnly = inputValue.replace(/\D/g, "");
                  // Limit to 10 digits
                  const limitedDigits = digitsOnly.substring(0, 10);

                  setFormData({ ...formData, customerPhone: limitedDigits });

                  // Real-time validation
                  const validation = validatePhone10Digits(limitedDigits);
                  if (validation.isValid) {
                    setPhoneError("");
                  } else {
                    setPhoneError(validation.error);
                  }
                }}
                placeholder="Enter your phone number"
                required
                disabled={paymentProcessing}
                data-testid="booking-phone-input"
                className={
                  phoneError ? "border-red-500 focus-visible:ring-red-500" : ""
                }
              />
              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address{" "}
              </label>
              <Input
                type="email"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                placeholder="Enter your email"
                disabled={paymentProcessing}
                data-testid="booking-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Spa <span className="text-red-500">*</span>
              </label>
              <Select
                options={allSpaOptions}
                value={selectedSpaOption}
                onChange={handleSpaChange}
                placeholder="Select a spa..."
                isDisabled={!!prefilledSpa || paymentProcessing}
                isSearchable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                data-testid="booking-spa-select"
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    minHeight: "40px",
                    borderColor: state.isFocused ? "#10b981" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
                    "&:hover": {
                      borderColor: state.isFocused ? "#10b981" : "#9ca3af",
                    },
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isSelected
                      ? "#10b981"
                      : state.isFocused
                        ? "#d1fae5"
                        : "white",
                    color: state.isSelected ? "white" : "#111827",
                    "&:hover": {
                      backgroundColor: state.isSelected ? "#10b981" : "#d1fae5",
                    },
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Service <span className="text-red-500">*</span>
              </label>
              <Select
                options={serviceOptions}
                value={selectedServiceOption}
                onChange={handleServiceChange}
                placeholder="Select a service..."
                isDisabled={!formData.spaId || paymentProcessing}
                isSearchable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                data-testid="booking-service-select"
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    minHeight: "40px",
                    borderColor: state.isFocused ? "#10b981" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
                    "&:hover": {
                      borderColor: state.isFocused ? "#10b981" : "#9ca3af",
                    },
                  }),
                  option: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: state.isSelected
                      ? "#10b981"
                      : state.isFocused
                        ? "#d1fae5"
                        : "white",
                    color: state.isSelected ? "white" : "#111827",
                    "&:hover": {
                      backgroundColor: state.isSelected ? "#10b981" : "#d1fae5",
                    },
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      // Re-validate when date changes
                      if (e.target.value && time) {
                        validateBookingTime(e.target.value, time);
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    disabled={paymentProcessing}
                    data-testid="booking-date-input"
                    className={`w-full ${
                      timeError && timeError.includes("Sunday")
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      // Re-validate when time changes
                      if (date && e.target.value) {
                        validateBookingTime(date, e.target.value);
                      }
                    }}
                    min={
                      selectedSpaData?.storeHours?.openingTime &&
                      !selectedSpaData?.storeHours?.is24Hours
                        ? selectedSpaData.storeHours.openingTime
                        : undefined
                    }
                    max={
                      selectedSpaData?.storeHours?.closingTime &&
                      !selectedSpaData?.storeHours?.is24Hours
                        ? selectedSpaData.storeHours.closingTime
                        : undefined
                    }
                    required
                    disabled={paymentProcessing}
                    data-testid="booking-time-input"
                    className={`w-full ${
                      timeError && !timeError.includes("Sunday")
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                </div>
              </div>
              {timeError && (
                <p className="text-red-500 text-xs mt-1">{timeError}</p>
              )}
              {selectedSpaData?.storeHours && (
                <p className="text-gray-500 text-xs mt-1">
                  {selectedSpaData.storeHours.is24Hours ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Open 24 Hours
                    </span>
                  ) : (
                    <>
                      Store hours: {selectedSpaData.storeHours.openingTime} -{" "}
                      {selectedSpaData.storeHours.closingTime}
                    </>
                  )}
                  {selectedSpaData.storeHours.sundayClosed &&
                    " (Closed on Sunday)"}
                </p>
              )}
            </div>

            {/* Coupon Code Section */}
            {formData.spaId && formData.service && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Have a coupon code?
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1"
                    disabled={!!appliedCoupon || paymentProcessing}
                  />
                  {appliedCoupon ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveCoupon}
                      disabled={paymentProcessing}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={
                        validatingCoupon ||
                        !couponCode.trim() ||
                        paymentProcessing
                      }
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {validatingCoupon ? "Applying..." : "Apply"}
                    </Button>
                  )}
                </div>
                {couponError && (
                  <p className="text-red-500 text-xs mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-emerald-600 text-xs mt-1">
                    ✓ Coupon "{appliedCoupon.coupon.code}" applied!
                  </p>
                )}
              </div>
            )}

            {/* Payment Type Selection */}
            {formData.spaId && formData.service && originalAmount > 0 && (
              <div className="border-t pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Choose Payment Option
                </h3>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: paymentType === "full" ? "#10b981" : "#e5e7eb",
                      backgroundColor: paymentType === "full" ? "#f0fdf4" : "transparent"
                    }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="full"
                      checked={paymentType === "full"}
                      onChange={(e) => setPaymentType(e.target.value)}
                      disabled={paymentProcessing}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Pay Full Amount
                      </div>
                      <div className="text-sm text-gray-600">
                        ₹{finalAmount.toLocaleString()} (One-time payment)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: paymentType === "booking_only" ? "#10b981" : "#e5e7eb",
                      backgroundColor: paymentType === "booking_only" ? "#f0fdf4" : "transparent"
                    }}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="booking_only"
                      checked={paymentType === "booking_only"}
                      onChange={(e) => setPaymentType(e.target.value)}
                      disabled={paymentProcessing}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        Book Now - Pay ₹{BOOKING_FEE.toLocaleString()} Only
                      </div>
                      <div className="text-sm text-gray-600">
                        Pay remaining ₹{pendingAmount.toLocaleString()} at the spa
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Pricing Summary with GST */}
            {formData.spaId && formData.service && originalAmount > 0 && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  Pricing Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Price:</span>
                    <span className="text-gray-900">
                      ₹{originalAmount.toLocaleString()}
                    </span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedCoupon.coupon.code}):</span>
                      <span>-₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Base Amount:</span>
                    <span>₹{baseAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>GST (18% included):</span>
                    <span>₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span className="text-gray-900">Total Amount:</span>
                    <span className="text-emerald-600">
                      ₹{finalAmount.toLocaleString()}
                    </span>
                  </div>
                  {paymentType === "booking_only" && (
                    <>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">Pay Now:</span>
                        <span className="font-medium text-emerald-600">
                          ₹{BOOKING_FEE.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pay at Spa:</span>
                        <span className="font-medium text-gray-900">
                          ₹{pendingAmount.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start space-x-2 pt-2">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={paymentProcessing}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                data-testid="booking-terms-checkbox"
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm text-gray-700 cursor-pointer"
              >
                I accept the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-emerald-600 hover:underline"
                >
                  Terms & Conditions
                </Link>
                <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Payment Security Note */}
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 text-xs text-gray-600">
              <svg
                className="w-4 h-4 text-emerald-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>
                Secure payment powered by Razorpay. Your payment information is
                encrypted and secure.
              </span>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={paymentProcessing}
                data-testid="booking-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !acceptedTerms || !razorpayLoaded}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="booking-submit-button"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  paymentType === "booking_only"
                    ? `Pay ₹${BOOKING_FEE.toLocaleString()} to Book`
                    : `Pay ₹${finalAmount.toLocaleString()}`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
