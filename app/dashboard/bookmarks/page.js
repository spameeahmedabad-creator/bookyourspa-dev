'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import SpaCard from '@/components/SpaCard';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get('/api/bookmarks');
      setBookmarks(response.data.bookmarks || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to view your bookmarks');
        router.push('/login');
      } else {
        toast.error('Failed to load bookmarks');
        console.error('Failed to fetch bookmarks:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (spaId) => {
    try {
      await axios.delete(`/api/bookmarks?spaId=${spaId}`);
      setBookmarks(bookmarks.filter((spa) => spa._id !== spaId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
      console.error('Failed to remove bookmark:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8" data-testid="bookmarks-page">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Bookmarks</h1>

        {bookmarks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Your bookmarked spas will appear here</p>
              <p className="text-gray-500 text-sm mt-2">Start bookmarking spas to save them for later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((spa) => (
              <div key={spa._id} className="relative">
                <SpaCard spa={spa} />
                <button
                  onClick={() => handleRemoveBookmark(spa._id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                  data-testid={`remove-bookmark-${spa._id}`}
                  aria-label="Remove bookmark"
                >
                  <Bookmark className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
