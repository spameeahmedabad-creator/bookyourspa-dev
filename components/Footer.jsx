"use client";

import Link from "next/link";
import { MapPin, Mail, Instagram, Facebook, Globe } from "lucide-react";

export default function Footer({ variant = "full", fourthColumn = "contact" }) {
  const currentYear = new Date().getFullYear();

  if (variant === "simple") {
    return (
      <footer className="bg-espresso text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} BookYourSpa. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-espresso text-white">
      {/* Top decorative stripe */}
      <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img
                src="/img/Your Spa.png"
                alt="BookYourSpa"
                className="h-16 w-auto object-contain brightness-200"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Your trusted platform for booking premium spa and wellness
              experiences across India.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                {
                  href: "https://www.instagram.com/bookyourspa_official/",
                  icon: Instagram,
                  label: "Instagram",
                },
                { href: "#", icon: Facebook, label: "Facebook" },
                { href: "#", icon: Globe, label: "Website" },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-emerald-500 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-emerald-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/terms", label: "Terms & Conditions" },
                { href: "/privacy", label: "Privacy Policy" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-emerald-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities / Contact */}
          <div>
            {fourthColumn === "cities" ? (
              <>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">
                  Cities
                </h4>
                <ul className="space-y-2.5">
                  {[
                    { city: "Ahmedabad", note: "15+ Spas" },
                    { city: "Gandhinagar", note: "5+ Spas" },
                    { city: "More cities", note: "Coming soon" },
                  ].map(({ city, note }) => (
                    <li key={city} className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-400 text-sm">
                        {city}
                        <span className="text-gray-600 text-xs ml-1.5">
                          {note}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-widest">
                  Contact
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-400 text-sm">
                      Ahmedabad, Gujarat
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <a
                      href="mailto:spameeahmedabad@gmail.com"
                      className="text-gray-400 hover:text-emerald-400 text-sm transition-colors"
                    >
                      spameeahmedabad@gmail.com
                    </a>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Divider + bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            &copy; {currentYear} BookYourSpa. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Made with <span className="text-emerald-400">♥</span> for wellness
            lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
