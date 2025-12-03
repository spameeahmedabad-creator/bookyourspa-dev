"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function SearchBar({ onSelectSpa }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isClickInSearchBar = searchRef.current?.contains(target);
      const isClickInDropdown = dropdownRef.current?.contains(target);

      if (!isClickInSearchBar && !isClickInDropdown) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const updateDropdownPosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        // Since dropdown uses 'fixed' positioning, we use viewport coordinates directly
        // getBoundingClientRect() already returns viewport-relative coordinates
        setDropdownPosition({
          top: rect.bottom + 8, // 8px gap below the input
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (showSuggestions) {
      updateDropdownPosition();
      // Update position on scroll/resize to keep dropdown aligned with input
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
    }

    return () => {
      window.removeEventListener("scroll", updateDropdownPosition, true);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [showSuggestions, query, suggestions]);

  // Close dropdown on scroll
  useEffect(() => {
    if (!showSuggestions) return;

    const handleScroll = () => {
      setShowSuggestions(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showSuggestions]);

  useEffect(() => {
    const searchSpas = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `/api/spas/search?q=${encodeURIComponent(query)}`
        );
        setSuggestions(response.data.spas);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchSpas, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (spa) => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    onSelectSpa(spa);
  };

  const renderDropdown = () => {
    if (!showSuggestions) return null;

    const dropdownContent = (
      <div
        ref={dropdownRef}
        className="fixed bg-white rounded-lg shadow-xl border max-h-64 sm:max-h-96 overflow-y-auto z-[9999]"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
        }}
        data-testid="search-suggestions"
      >
        {suggestions.length > 0 ? (
          suggestions.map((spa) => (
            <button
              key={spa._id}
              onClick={() => handleSelect(spa)}
              className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-emerald-50 transition-colors border-b last:border-b-0"
              data-testid={`suggestion-${spa._id}`}
            >
              <div className="font-semibold text-gray-900 text-sm sm:text-base">
                {spa.title}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                {spa.location?.region || spa.location?.address}
              </div>
              {spa.services?.length > 0 && (
                <div className="text-xs text-gray-500 mt-1 hidden sm:block">
                  {spa.services.slice(0, 3).join(", ")}
                </div>
              )}
            </button>
          ))
        ) : query.trim().length >= 2 && !loading ? (
          <div className="p-4 text-center text-gray-500">
            No spas found for "{query}"
          </div>
        ) : null}
      </div>
    );

    if (typeof window !== "undefined") {
      return createPortal(dropdownContent, document.body);
    }
    return null;
  };

  return (
    <>
      <div
        className="relative max-w-3xl mx-auto px-2 sm:px-0"
        ref={searchRef}
        data-testid="search-bar"
      >
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search spa, location, or service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-4 sm:py-6 text-sm sm:text-lg rounded-full shadow-lg border-2 border-white focus:border-emerald-300"
            data-testid="search-input"
          />
        </div>
      </div>
      {renderDropdown()}
    </>
  );
}
