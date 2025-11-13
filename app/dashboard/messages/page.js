'use client';

import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8" data-testid="messages-page">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Your messages will appear here</p>
            <p className="text-gray-500 text-sm mt-2">Feature coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
