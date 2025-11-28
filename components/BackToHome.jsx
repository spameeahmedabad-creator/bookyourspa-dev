"use client";

import Link from "next/link";

export default function BackToHome({
  className = "",
  noWrapper = false,
  ...linkProps
}) {
  const linkContent = (
    <Link
      href="/"
      className={`text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center ${className}`}
      {...linkProps}
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
  );

  if (noWrapper) {
    return linkContent;
  }

  return <div className={`mt-8 text-center ${className}`}>{linkContent}</div>;
}
