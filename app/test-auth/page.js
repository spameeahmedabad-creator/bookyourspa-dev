'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/debug/auth-status');
      setAuthStatus(response.data);
    } catch (error) {
      setAuthStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-2">
            <div><Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link></div>
            <div><Link href="/" className="text-blue-600 hover:underline">Go to Home</Link></div>
            <div><Link href="/dashboard/bookings" className="text-blue-600 hover:underline">Go to My Bookings (Protected)</Link></div>
            <div><Link href="/dashboard/add-listing" className="text-blue-600 hover:underline">Go to Add Listing (Protected)</Link></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Cookie Info</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {document.cookie || 'No cookies found'}
          </pre>
        </div>
      </div>
    </div>
  );
}
