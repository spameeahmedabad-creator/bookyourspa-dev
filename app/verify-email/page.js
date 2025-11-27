"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const email = searchParams.get("email");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      setStatus("error");
    } else if (email) {
      setStatus("pending");
    } else {
      setStatus("loading");
    }
  }, [email, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            BookYourSpa
          </h1>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>
              {status === "pending" && "Please verify your email address"}
              {status === "error" && "Verification failed"}
              {status === "loading" && "Checking verification status"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "pending" && (
              <>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-2">
                    We've sent a verification email to:
                  </p>
                  <p className="font-semibold text-emerald-600 mb-4">{email}</p>
                  <p className="text-sm text-gray-600">
                    Please check your inbox and click the verification link to
                    activate your account.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    The link will expire in 24 hours.
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-4">
                    {error === "invalid_or_expired" &&
                      "The verification link is invalid or has expired."}
                    {error === "user_not_found" && "User account not found."}
                    {error === "verification_failed" &&
                      "Verification failed. Please try again."}
                    {!error && "An error occurred during verification."}
                  </p>
                  <p className="text-sm text-gray-600">
                    Please request a new verification email or contact support.
                  </p>
                </div>
                <div className="pt-4 space-y-2">
                  <Link href="/register">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Register Again
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === "loading" && (
              <div className="text-center">
                <div className="mx-auto w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700">Verifying your email...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Link href="/" className="block text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                BookYourSpa
              </h1>
            </Link>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-700">Loading...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
