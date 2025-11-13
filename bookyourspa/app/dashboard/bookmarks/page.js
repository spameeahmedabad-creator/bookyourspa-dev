'use client';

import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8" data-testid="bookmarks-page">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bookmarks</h1>

        <Card>
          <CardContent className="p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Your bookmarked spas will appear here</p>
            <p className="text-gray-500 text-sm mt-2">Feature coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
