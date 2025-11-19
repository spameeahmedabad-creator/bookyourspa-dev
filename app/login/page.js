"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";
import { validatePhone, formatPhoneInput } from "@/lib/phone-validation";

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", phone: "", otp: "" });
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneInput(value, "IN");
    setFormData({ ...formData, phone: formatted });
    if (phoneError) {
      setPhoneError("");
    }
  };

  const handlePhoneBlur = () => {
    if (!formData.phone) return;
    const validation = validatePhone(formData.phone, "IN");
    if (!validation.isValid) {
      setPhoneError(validation.error);
    } else {
      setPhoneError("");
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Please enter your full name");
      return;
    }

    const phoneValidation = validatePhone(formData.phone, "IN");
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      toast.error(phoneValidation.error);
      return;
    }

    // Ensure formatted phone saved locally
    if (
      phoneValidation.formatted &&
      formData.phone !== phoneValidation.formatted
    ) {
      setFormData((prev) => ({ ...prev, phone: phoneValidation.formatted }));
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/auth/send-otp", {
        name: trimmedName,
        phone: phoneValidation.formatted,
      });
      toast.success(response.data.message);
      // if (response.data.otp) {
      //   toast.info(`Development OTP: ${response.data.otp}`);
      // }
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.phone) {
      toast.error("Please enter your phone number again");
      setStep(1);
      return;
    }

    const phoneValidation = validatePhone(formData.phone, "IN");
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error);
      toast.error(phoneValidation.error);
      setStep(1);
      return;
    }

    if (!formData.otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/auth/verify-otp", {
        phone: phoneValidation.formatted,
        otp: formData.otp,
        name: formData.name.trim(),
      });
      toast.success("Login successful!");
      // Use window.location to force a full page reload with auth
      window.location.href = "/";
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
            data-testid="back-to-home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Back to Home
          </Link>
        </div>
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            BookYourSpa
          </h1>
        </Link>

        <Card data-testid="login-card">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              {step === 1
                ? "Enter your details to get started"
                : "Enter the OTP sent to your phone"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    required
                    data-testid="login-name-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    placeholder="+91 1234567890"
                    required
                    data-testid="login-phone-input"
                    className={
                      phoneError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {phoneError ? (
                    <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                  ) : (
                    <p className="text-gray-500 text-xs mt-1">
                      Include country code, e.g. +91 9876543210
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                  data-testid="send-otp-button"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.otp}
                    onChange={(e) =>
                      setFormData({ ...formData, otp: e.target.value })
                    }
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    data-testid="otp-input"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                  data-testid="verify-otp-button"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                  data-testid="back-button"
                >
                  Back
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account? You'll be automatically registered!
        </p>
      </div>
    </div>
  );
}
