"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X, Tag, Clock, Sparkles, Copy, Check } from "lucide-react";

const STATIC_BANNER_CONFIG = {
  enabled: false,
  image: "/etc/rainbow-banner-coupan.png",
  mobileImage: "/etc/rainbow-banner-coupan-mobile.jpeg",
  alt: "Special Coupon Offer",
  link: null,
};

const THEME = {
  emerald: { from: "#059669", via: "#0d9488", to: "#059669", badge: "bg-white/20 border-white/30" },
  red:     { from: "#dc2626", via: "#e11d48", to: "#dc2626", badge: "bg-white/20 border-white/30" },
  purple:  { from: "#7c3aed", via: "#6d28d9", to: "#7c3aed", badge: "bg-white/20 border-white/30" },
  orange:  { from: "#d97706", via: "#ea580c", to: "#d97706", badge: "bg-white/20 border-white/30" },
  blue:    { from: "#2563eb", via: "#0891b2", to: "#2563eb", badge: "bg-white/20 border-white/30" },
  pink:    { from: "#db2777", via: "#e11d48", to: "#db2777", badge: "bg-white/20 border-white/30" },
};

function CountdownBit({ value, unit }) {
  return (
    <span className="inline-flex flex-col items-center leading-none">
      <span className="font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[8px] opacity-70 uppercase tracking-wider">{unit}</span>
    </span>
  );
}

function Countdown({ expiresAt }) {
  const calc = useCallback(() => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  }, [expiresAt]);

  const [t, setT] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  if (!t) return <span className="text-xs opacity-80 font-medium">Ending soon!</span>;

  return (
    <div className="inline-flex items-center gap-1 text-xs">
      <Clock className="w-3 h-3 opacity-75 flex-shrink-0" />
      <div className="flex items-end gap-0.5">
        {t.d > 0 && <><CountdownBit value={t.d} unit="d" /><span className="opacity-50 mb-0.5">:</span></>}
        <CountdownBit value={t.h} unit="h" />
        <span className="opacity-50 mb-0.5">:</span>
        <CountdownBit value={t.m} unit="m" />
        {t.d === 0 && <><span className="opacity-50 mb-0.5">:</span><CountdownBit value={t.s} unit="s" /></>}
      </div>
    </div>
  );
}

function CouponCode({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 bg-white/25 hover:bg-white/35 active:scale-95 border border-white/40 px-3 py-1.5 rounded-xl text-sm sm:text-base font-mono font-black tracking-widest transition-all duration-200 cursor-pointer select-none shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
      title="Click to copy code"
    >
      <Tag className="w-3 h-3 flex-shrink-0" />
      {code}
      {copied ? (
        <Check className="w-3 h-3 text-white flex-shrink-0" />
      ) : (
        <Copy className="w-3 h-3 opacity-70 flex-shrink-0" />
      )}
    </button>
  );
}

export default function PromotionalBanner() {
  const [promotions, setPromotions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!STATIC_BANNER_CONFIG.enabled) {
      fetchPromotions();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (promotions.length > 1) {
      const id = setInterval(() => setCurrentIndex((p) => (p + 1) % promotions.length), 4000);
      return () => clearInterval(id);
    }
  }, [promotions.length]);

  const fetchPromotions = async () => {
    try {
      const response = await axios.get("/api/promotions");
      if (response.data.success && response.data.promotions.length > 0) {
        setPromotions(response.data.promotions);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  // ── Static banner ──
  if (STATIC_BANNER_CONFIG.enabled) {
    if (dismissed) return null;
    const imgEl = (src, cls) =>
      STATIC_BANNER_CONFIG.link ? (
        <a href={STATIC_BANNER_CONFIG.link} target="_blank" rel="noopener noreferrer" className="block w-full">
          <img src={src} alt={STATIC_BANNER_CONFIG.alt} className={cls} />
        </a>
      ) : (
        <img src={src} alt={STATIC_BANNER_CONFIG.alt} className={cls} />
      );

    return (
      <div className="relative bg-[#c41230] overflow-hidden">
        <div className="block sm:hidden w-full">{imgEl(STATIC_BANNER_CONFIG.mobileImage, "w-full h-auto block")}</div>
        <div className="hidden sm:block w-full">{imgEl(STATIC_BANNER_CONFIG.image, "w-full h-auto block")}</div>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full transition-colors z-10"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    );
  }

  // ── Dynamic banner ──
  if (loading || dismissed || promotions.length === 0) return null;

  const promo = promotions[currentIndex];
  const theme = THEME[promo.color] || THEME.emerald;

  return (
    <div
      className="relative overflow-hidden text-white"
      style={{
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
        backgroundSize: "200% 200%",
        animation: "bannerShift 4s ease infinite",
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
          animation: "bannerShimmer 3s ease-in-out infinite",
        }}
      />

      {/* Left + right glow orbs */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-2.5 sm:py-3 flex items-center justify-center gap-2 sm:gap-4 pr-8">

          {/* Left sparkle */}
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-90 flex-shrink-0 animate-pulse" />

          {/* Content */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Promo text */}
            <span className="font-semibold text-sm sm:text-base text-center leading-tight">
              {promo.text}
            </span>

            {/* Divider */}
            <span className="hidden sm:inline-block w-px h-5 bg-white/30" />

            {/* Coupon code — click to copy */}
            <CouponCode code={promo.code} />

            {/* Countdown */}
            <span className="hidden sm:flex items-center">
              <Countdown expiresAt={promo.expiresAt} />
            </span>
          </div>

          {/* Right sparkle */}
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-90 flex-shrink-0 animate-pulse" />
        </div>

        {/* Dot indicators */}
        {promotions.length > 1 && (
          <div className="flex justify-center gap-1 pb-1.5">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-4 h-1 bg-white" : "w-1 h-1 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Promotion ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/20 hover:bg-black/35 rounded-full transition-all duration-200 hover:scale-110"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <style jsx>{`
        @keyframes bannerShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes bannerShimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
