'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import axios from 'axios';

export default function SearchBar({ onSelectSpa }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchSpas = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`/api/spas/search?q=${encodeURIComponent(query)}`);
        setSuggestions(response.data.spas);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchSpas, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (spa) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSelectSpa(spa);
  };

  return (
    <div className="relative max-w-3xl mx-auto" ref={searchRef} data-testid="search-bar">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search by location, spa name, or service..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-6 text-lg rounded-full shadow-lg border-2 border-white focus:border-emerald-300"
          data-testid="search-input"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto z-50" data-testid="search-suggestions">
          {suggestions.map((spa) => (
            <button
              key={spa._id}
              onClick={() => handleSelect(spa)}
              className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b last:border-b-0"
              data-testid={`suggestion-${spa._id}`}
            >
              <div className="font-semibold text-gray-900">{spa.title}</div>
              <div className="text-sm text-gray-600">
                {spa.location?.region || spa.location?.address}
              </div>
              {spa.services?.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {spa.services.slice(0, 3).join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {showSuggestions && query.trim().length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute w-full mt-2 bg-white rounded-lg shadow-xl border p-4 text-center text-gray-500">
          No spas found for "{query}"
        </div>
      )}
    </div>
  );
}
