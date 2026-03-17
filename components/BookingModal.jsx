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
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Tag,
  Shield,
  Loader2,
} from "lucide-react";

const GST_RATE = 0.18;
const BOOKING_FEE = 199;

const STEPS = [
  { id: 1, label: "Service", icon: Sparkles },
  { id: 2, label: "Schedule", icon: Calendar },
  { id: 3, label: "Confirm", icon: Shield },
];

export default function BookingModal({ open, onClose, prefilledSpa = null }) {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [paymentType] = useState("booking_only");

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      fetchUser();
      if (!prefilledSpa) fetchSpas();
      // Reset state
      setCurrentStep(1);
      setDate("");
      setTime("");
      setPhoneError("");
      setAcceptedTerms(false);
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError("");
      setPaymentProcessing(false);
      if (typeof window !== "undefined" && window.Razorpay) {
        setRazorpayLoaded(true);
      }
    }
    wasOpenRef.current = open;
  }, [open, prefilledSpa]);

  useEffect(() => {
    const fetchFullSpaDetails = async () => {
      if (prefilledSpa) {
        setFormData((prev) => ({
          ...prev,
          spaId: prefilledSpa._id,
          spaName: prefilledSpa.title,
        }));
        try {
          const response = await axios.get(`/api/spas/${prefilledSpa._id}`);
          const fullSpaData = response.data.spa;
          setSelectedSpaData(fullSpaData);
        } catch {
          setSelectedSpaData(prefilledSpa);
        }
      }
    };
    fetchFullSpaDetails();
  }, [prefilledSpa]);

  const validateBookingTime = (selectedDate, selectedTime) => {
    if (!selectedSpaData || !selectedDate || !selectedTime) {
      setTimeError("");
      return true;
    }
    const bookingDate = new Date(selectedDate);
    const dayOfWeek = bookingDate.getDay();

    if (dayOfWeek === 0 && selectedSpaData.storeHours?.sundayClosed) {
      setTimeError("This spa is closed on Sundays. Please select another day.");
      return false;
    }
    if (selectedSpaData.storeHours?.is24Hours) {
      setTimeError("");
      return true;
    }
    if (
      selectedSpaData.storeHours?.openingTime &&
      selectedSpaData.storeHours?.closingTime
    ) {
      const toMins = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const open = toMins(selectedSpaData.storeHours.openingTime);
      const close = toMins(selectedSpaData.storeHours.closingTime);
      const booking = toMins(selectedTime);
      if (booking < open || booking >= close) {
        setTimeError(
          `Booking time must be between ${selectedSpaData.storeHours.openingTime} and ${selectedSpaData.storeHours.closingTime}.`,
        );
        return false;
      }
    }
    setTimeError("");
    return true;
  };

  useEffect(() => {
    if (date && time) {
      setFormData((prev) => ({ ...prev, datetime: `${date}T${time}` }));
      validateBookingTime(date, time);
    } else {
      setFormData((prev) => ({ ...prev, datetime: "" }));
      setTimeError("");
    }
  }, [date, time, selectedSpaData]);

  useEffect(() => {
    if (formData.service) {
      setCouponCode("");
      setAppliedCoupon(null);
      setCouponError("");
    }
  }, [formData.service]);

  useEffect(() => {
    if (appliedCoupon && date) {
      const coupon = appliedCoupon.coupon;
      const bookingDate = new Date(date);
      bookingDate.setHours(0, 0, 0, 0);
      let isValid = true;
      let errorMessage = "";
      if (coupon.startDate) {
        const start = new Date(coupon.startDate);
        start.setHours(0, 0, 0, 0);
        if (bookingDate < start) {
          isValid = false;
          errorMessage = `Coupon "${coupon.code}" is only valid from ${new Date(coupon.startDate).toLocaleDateString()}. Coupon removed.`;
        }
      }
      if (isValid && coupon.endDate) {
        const end = new Date(coupon.endDate);
        end.setHours(23, 59, 59, 999);
        if (bookingDate > end) {
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
      const phoneDigits = userData.phone
        ? userData.phone.replace(/\D/g, "").substring(0, 10)
        : "";
      setFormData((prev) => ({
        ...prev,
        customerName: userData.name,
        customerPhone: phoneDigits,
        customerEmail: userData.email || "",
      }));
    } catch {
      // not logged in, form stays empty
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
        } catch {
          setSelectedSpaData(selectedSpa);
          setFormData((prev) => ({
            ...prev,
            spaId: selectedSpa._id,
            spaName: selectedSpa.title,
            service: "",
          }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, spaId: "", spaName: "", service: "" }));
      setSelectedSpaData(null);
      setTimeError("");
    }
  };

  // Build service options from pricing or fallback to services array
  const serviceOptions = (() => {
    if (selectedSpaData?.pricing?.length > 0) {
      return selectedSpaData.pricing
        .filter((item) => item.title && item.price !== undefined)
        .map((item) => ({
          value: item.title,
          price: item.price,
          label: item.title,
          formattedPrice: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(item.price),
        }));
    }
    if (selectedSpaData?.services?.length > 0) {
      return selectedSpaData.services
        .filter((s) => typeof s === "string" && s.trim())
        .map((s) => ({ value: s, label: s, price: 0, formattedPrice: "" }));
    }
    return [];
  })();

  const spaOptions = spas.map((spa) => ({ value: spa._id, label: spa.title }));
  const allSpaOptions =
    prefilledSpa && !spaOptions.find((opt) => opt.value === prefilledSpa._id)
      ? [{ value: prefilledSpa._id, label: prefilledSpa.title }, ...spaOptions]
      : spaOptions;

  const selectedSpaOption = allSpaOptions.find(
    (o) => o.value === formData.spaId,
  );

  const selectedServicePrice =
    selectedSpaData?.pricing?.find((p) => p.title === formData.service)
      ?.price || 0;
  const originalAmount = selectedServicePrice;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const amountAfterDiscount = Math.max(0, originalAmount - discountAmount);
  const finalAmount = amountAfterDiscount;
  const pendingAmount =
    paymentType === "booking_only" ? finalAmount - BOOKING_FEE : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    if (!formData.spaId || !selectedServicePrice) {
      setCouponError("Please select a spa and service first");
      return;
    }
    if (!date) {
      setCouponError("Please select a booking date first");
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
        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);
        if (coupon.startDate) {
          const start = new Date(coupon.startDate);
          start.setHours(0, 0, 0, 0);
          if (bookingDate < start) {
            setCouponError(
              `This coupon is only valid from ${new Date(coupon.startDate).toLocaleDateString()}`,
            );
            setAppliedCoupon(null);
            setValidatingCoupon(false);
            return;
          }
        }
        if (coupon.endDate) {
          const end = new Date(coupon.endDate);
          end.setHours(23, 59, 59, 999);
          if (bookingDate > end) {
            setCouponError(
              `This coupon expired on ${new Date(coupon.endDate).toLocaleDateString()}.`,
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
        error.response?.data?.reason || "Failed to validate coupon",
      );
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
  };

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
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
            setLoading(false);
            toast.error("Payment cancelled");
          },
        },
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking_id: orderData.booking.id,
            });
            if (verifyResponse.data.success) {
              toast.success(
                "🎉 Payment successful! Your booking is confirmed. Check your email and WhatsApp for details.",
              );
              onClose();
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
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (error) {
            toast.error(
              error.response?.data?.error ||
                "Payment verification failed. Please contact support.",
            );
          } finally {
            setPaymentProcessing(false);
            setLoading(false);
          }
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", (response) => {
        toast.error(
          response.error.description || "Payment failed. Please try again.",
        );
        setPaymentProcessing(false);
        setLoading(false);
      });
      razorpay.open();
    },
    [razorpayLoaded, formData.spaName, formData.service, onClose],
  );

  const handleSubmit = async () => {
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
    const phoneValidation = validatePhone10Digits(formData.customerPhone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      toast.error(phoneValidation.error);
      return;
    }
    if (!validateBookingTime(date, time)) {
      toast.error(timeError);
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms & Conditions to proceed");
      return;
    }
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error("Payment system is loading. Please wait and try again.");
      return;
    }
    setLoading(true);
    setPaymentProcessing(true);
    try {
      const datetime = new Date(formData.datetime);
      const dateStr = datetime.toISOString().split("T")[0];
      const timeStr = datetime.toTimeString().split(" ")[0].slice(0, 5);
      const bookingData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        spaId: formData.spaId,
        service: formData.service,
        date: dateStr,
        time: timeStr,
        couponCode: appliedCoupon?.coupon?.code || null,
        paymentType,
      };
      const response = await axios.post(
        "/api/payments/create-order",
        bookingData,
      );
      if (response.data.success) {
        initiatePayment(response.data);
      } else {
        toast.error(response.data.error || "Failed to create payment order");
        setPaymentProcessing(false);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to initiate payment");
      setPaymentProcessing(false);
      setLoading(false);
    }
  };

  // Step validation
  const step1Valid = !!(formData.spaId && formData.service);
  const step2Valid = !!(formData.datetime && !timeError);

  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);

  const goNext = () => {
    if (currentStep === 1) {
      setStep1Attempted(true);
      if (!step1Valid) {
        if (!formData.spaId) toast.error("Please select a spa");
        else toast.error("Please select a service to continue");
        return;
      }
    }
    if (currentStep === 2) {
      setStep2Attempted(true);
      if (!formData.datetime) { toast.error("Please select a date and time"); return; }
      if (timeError) { toast.error(timeError); return; }
    }
    setCurrentStep((s) => Math.min(3, s + 1));
  };

  const goPrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  // Select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "12px",
      borderColor: state.isFocused ? "#10b981" : "#e4ddd2",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(16,185,129,0.15)" : "none",
      backgroundColor: "#faf8f5",
      "&:hover": { borderColor: state.isFocused ? "#10b981" : "#a08b7c" },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#10b981"
        : state.isFocused
          ? "#d1fae5"
          : "white",
      color: state.isSelected ? "white" : "#2C2420",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      borderRadius: "12px",
      overflow: "hidden",
    }),
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => toast.error("Failed to load payment system")}
      />

      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onClose={onClose}
          className="max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[92vh] overflow-y-auto scrollbar-thin p-0 gap-0 rounded-3xl border-0 shadow-luxury-lg"
          data-testid="booking-modal"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 pt-6 pb-8 rounded-t-3xl">
            <DialogHeader>
              <DialogTitle className="text-white font-playfair text-xl sm:text-2xl font-bold">
                {currentStep === 1 && "Choose Your Experience"}
                {currentStep === 2 && "Pick Your Time"}
                {currentStep === 3 && "Confirm & Pay"}
              </DialogTitle>
              <p className="text-emerald-100 text-sm mt-1">
                {formData.spaName || "Select a spa to get started"}
              </p>
            </DialogHeader>

            {/* Step indicator */}
            <div className="flex items-center gap-0 mt-5">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isDone = currentStep > step.id;
                return (
                  <div
                    key={step.id}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isDone
                            ? "bg-white text-emerald-600 shadow-md"
                            : isActive
                              ? "bg-white text-emerald-600 shadow-lg ring-2 ring-white/50 scale-110"
                              : "bg-emerald-700/50 text-emerald-200"
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Icon className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${isActive || isDone ? "text-white" : "text-emerald-300"}`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${isDone ? "bg-white" : "bg-emerald-700/50"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div className="px-6 py-5 bg-sand-50">
            {/* ─── STEP 1: Spa + Service ─── */}
            {currentStep === 1 && (
              <div className="space-y-5 step-enter">
                {/* Spa selector */}
                {!prefilledSpa && (
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      <span>Select Spa <span className="text-red-400 normal-case">*</span></span>
                      {step1Attempted && !formData.spaId && (
                        <span className="text-red-400 normal-case font-normal text-[11px]">Required</span>
                      )}
                    </label>
                    <Select
                      options={allSpaOptions}
                      value={selectedSpaOption || null}
                      onChange={handleSpaChange}
                      placeholder="Search and select a spa..."
                      isSearchable
                      className="react-select-container"
                      classNamePrefix="react-select"
                      menuPortalTarget={
                        typeof document !== "undefined" ? document.body : null
                      }
                      menuPosition="fixed"
                      styles={selectStyles}
                    />
                  </div>
                )}

                {/* Service selector */}
                {formData.spaId && (
                  <div>
                    <label className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      <span>Select Service <span className="text-red-400 normal-case">*</span></span>
                      {step1Attempted && !formData.service && formData.spaId && (
                        <span className="text-red-400 normal-case font-normal text-[11px]">Please choose a service</span>
                      )}
                    </label>
                    {serviceOptions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                        {serviceOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                service: opt.value,
                              }))
                            }
                            className={`flex items-center justify-between p-3.5 rounded-2xl border-2 text-left transition-all duration-200 ${
                              formData.service === opt.value
                                ? "border-emerald-500 bg-emerald-50 shadow-luxury"
                                : "border-sand-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  formData.service === opt.value
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-gray-300"
                                }`}
                              >
                                {formData.service === opt.value && (
                                  <Check className="w-2.5 h-2.5 text-white" />
                                )}
                              </div>
                              <span
                                className={`text-sm font-medium ${formData.service === opt.value ? "text-emerald-800" : "text-gray-700"}`}
                              >
                                {opt.label}
                              </span>
                            </div>
                            {opt.formattedPrice && (
                              <span
                                className={`text-sm font-bold flex-shrink-0 ${formData.service === opt.value ? "text-emerald-600" : "text-gray-500"}`}
                              >
                                {opt.formattedPrice}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-400 bg-white rounded-2xl border border-sand-200">
                        No services available for this spa
                      </div>
                    )}
                  </div>
                )}

                {!formData.spaId && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className="text-sm text-gray-400">
                      Select a spa to see available services
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── STEP 2: Date + Time ─── */}
            {currentStep === 2 && (
              <div className="space-y-5 step-enter">
                {/* Store hours info */}
                {selectedSpaData?.storeHours && (
                  <div className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-sand-200">
                    <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        {selectedSpaData.storeHours.is24Hours ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                            Open 24 Hours
                          </span>
                        ) : (
                          `${selectedSpaData.storeHours.openingTime} – ${selectedSpaData.storeHours.closingTime}`
                        )}
                      </p>
                      {selectedSpaData.storeHours.sundayClosed && (
                        <p className="text-xs text-orange-500 mt-0.5">
                          Closed on Sundays
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Select Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (e.target.value && time)
                          validateBookingTime(e.target.value, time);
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      disabled={paymentProcessing}
                      data-testid="booking-date-input"
                      className={`pl-10 h-11 rounded-2xl bg-white border-sand-200 focus:border-emerald-400 focus-visible:ring-emerald-200 ${
                        timeError?.includes("Sunday") ? "border-red-300" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Select Time <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                        if (date && e.target.value)
                          validateBookingTime(date, e.target.value);
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
                      className={`pl-10 h-11 rounded-2xl bg-white border-sand-200 focus:border-emerald-400 focus-visible:ring-emerald-200 ${
                        timeError && !timeError.includes("Sunday")
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                  </div>
                </div>

                {timeError && (
                  <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl border border-red-100">
                    {timeError}
                  </p>
                )}
              </div>
            )}

            {/* ─── STEP 3: Your Details + Confirm ─── */}
            {currentStep === 3 && (
              <div className="space-y-4 step-enter">
                {/* Personal details */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Your Details
                  </p>

                  {/* Name */}
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-500 mb-1.5 pl-1">
                      <span>Full Name <span className="text-red-400">*</span></span>
                      {formData.customerName && (
                        <span className="text-emerald-500 flex items-center gap-1 text-[11px]">
                          <Check className="w-3 h-3" /> Looks good
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                      <Input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({ ...formData, customerName: e.target.value })
                        }
                        placeholder="Enter your full name"
                        required
                        disabled={paymentProcessing}
                        data-testid="booking-name-input"
                        className={`pl-10 h-11 rounded-2xl bg-white focus:border-emerald-400 focus-visible:ring-emerald-200 ${formData.customerName ? "border-emerald-200" : "border-sand-200"}`}
                      />
                    </div>
                    {!formData.customerName && (
                      <p className="text-[11px] text-gray-400 mt-1 pl-1">Required to confirm your booking</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center justify-between text-xs text-gray-500 mb-1.5 pl-1">
                      <span>Phone Number <span className="text-red-400">*</span></span>
                      {!phoneError && formData.customerPhone.length === 10 && (
                        <span className="text-emerald-500 flex items-center gap-1 text-[11px]">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                      <Input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .substring(0, 10);
                          setFormData({ ...formData, customerPhone: digits });
                          const v = validatePhone10Digits(digits);
                          setPhoneError(v.isValid ? "" : v.error);
                        }}
                        placeholder="10-digit mobile number"
                        required
                        disabled={paymentProcessing}
                        data-testid="booking-phone-input"
                        className={`pl-10 h-11 rounded-2xl bg-white focus:border-emerald-400 focus-visible:ring-emerald-200 ${phoneError ? "border-red-300 focus-visible:ring-red-200" : formData.customerPhone.length === 10 ? "border-emerald-200" : "border-sand-200"}`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-red-500 text-xs mt-1 pl-1 flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-100 flex items-center justify-center text-[10px] flex-shrink-0">!</span>
                        {phoneError}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center text-xs text-gray-500 mb-1.5 pl-1 gap-1">
                      Email Address
                      <span className="text-gray-400 text-[10px] font-normal">(optional — for booking confirmation)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                      <Input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          setFormData({ ...formData, customerEmail: e.target.value })
                        }
                        placeholder="your@email.com"
                        disabled={paymentProcessing}
                        data-testid="booking-email-input"
                        className="pl-10 h-11 rounded-2xl bg-white border-sand-200 focus:border-emerald-400 focus-visible:ring-emerald-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking summary card */}
                <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 border-b border-sand-200">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                      Booking Summary
                    </p>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Spa</span>
                      <span className="font-medium text-gray-800 text-right ml-4 line-clamp-1 max-w-[55%]">
                        {formData.spaName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Service</span>
                      <span className="font-medium text-gray-800 text-right ml-4 line-clamp-1 max-w-[55%]">
                        {formData.service}
                      </span>
                    </div>
                    {date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date & Time</span>
                        <span className="font-medium text-gray-800">
                          {new Date(date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                          {time && `, ${time}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coupon */}
                {originalAmount > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 pointer-events-none" />
                        <Input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError("");
                          }}
                          placeholder="Enter coupon code"
                          disabled={!!appliedCoupon || paymentProcessing}
                          className="pl-10 h-10 rounded-xl bg-white border-sand-200 focus:border-emerald-400 focus-visible:ring-emerald-200 text-sm"
                        />
                      </div>
                      {appliedCoupon ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveCoupon}
                          disabled={paymentProcessing}
                          className="h-10 px-3 rounded-xl text-red-500 border-red-200 hover:bg-red-50 text-sm font-medium"
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
                          className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-medium"
                        >
                          {validatingCoupon ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-xs mt-1 pl-1">
                        {couponError}
                      </p>
                    )}
                    {appliedCoupon && (
                      <p className="text-emerald-600 text-xs mt-1 pl-1 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Coupon "{appliedCoupon.coupon.code}" applied!
                      </p>
                    )}
                  </div>
                )}

                {/* Pricing breakdown */}
                {originalAmount > 0 && (
                  <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
                    <div className="px-4 py-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Service Price</span>
                        <span className="text-gray-800">
                          ₹{originalAmount.toLocaleString()}
                        </span>
                      </div>
                      {appliedCoupon && discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Discount ({appliedCoupon.coupon.code})</span>
                          <span>−₹{discountAmount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-2 border-t border-sand-100 font-semibold">
                        <span className="text-gray-700">Total Amount</span>
                        <span className="text-emerald-600">
                          ₹{finalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Pay now split */}
                    <div className="bg-emerald-50 px-4 py-3 border-t border-emerald-100">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-emerald-800">
                          Pay Now (Booking Fee)
                        </span>
                        <span className="font-bold text-emerald-700">
                          ₹{BOOKING_FEE.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Pay at Spa</span>
                        <span>₹{pendingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 w-5 h-5 flex-shrink-0">
                    {/* Real input covers the visual box — clicking anywhere on it works */}
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      disabled={paymentProcessing}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                      data-testid="booking-terms-checkbox"
                    />
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 pointer-events-none ${
                        acceptedTerms
                          ? "bg-emerald-500 border-emerald-500"
                          : "bg-white border-sand-300 group-hover:border-emerald-400"
                      }`}
                    >
                      {acceptedTerms && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I accept the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
                    >
                      Terms & Conditions
                    </Link>
                    <span className="text-red-400"> *</span>
                  </span>
                </label>

                {/* Security note */}
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-sand-100 rounded-xl px-3 py-2.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Secure payment powered by Razorpay. Your payment info is
                  encrypted.
                </div>
              </div>
            )}
          </div>

          {/* Footer navigation */}
          <div className="px-6 py-4 bg-white rounded-b-3xl border-t border-sand-100 flex items-center gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={goPrev}
                disabled={paymentProcessing}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-600 bg-sand-100 hover:bg-sand-200 transition-colors disabled:opacity-50"
                data-testid="booking-cancel-button"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                disabled={paymentProcessing}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-gray-600 bg-sand-100 hover:bg-sand-200 transition-colors"
                data-testid="booking-cancel-button"
              >
                Cancel
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={paymentProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-luxury hover:shadow-luxury-lg transition-all duration-300 disabled:opacity-60"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !acceptedTerms || !razorpayLoaded}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-luxury hover:shadow-luxury-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="booking-submit-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Pay ₹{BOOKING_FEE.toLocaleString()} to Book
                  </>
                )}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
