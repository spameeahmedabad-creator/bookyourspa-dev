'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BookingModal from '@/components/BookingModal';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function SpaDetailPage() {
  const params = useParams();
  const [spa, setSpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchSpaDetails();
    }
  }, [params.id]);

  const fetchSpaDetails = async () => {
    try {
      const response = await axios.get(`/api/spas/${params.id}`);
      setSpa(response.data.spa);
    } catch (error) {
      toast.error('Failed to load spa details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!spa) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Spa not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8" data-testid="spa-detail-page">
        {/* Gallery */}
        {spa.gallery && spa.gallery.length > 0 && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={spa.gallery[0]}
              alt={spa.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="spa-detail-title">{spa.title}</h1>
              
              {spa.location && (
                <div className="flex items-start text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2 mt-1 flex-shrink-0" />
                  <div>
                    <p>{spa.location.address}</p>
                    <p className="text-sm">{spa.location.region}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {spa.description && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{spa.description}</p>
              </div>
            )}

            {/* Services */}
            {spa.services && spa.services.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Services</h2>
                <div className="grid grid-cols-2 gap-3">
                  {spa.services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            {spa.pricing && spa.pricing.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
                <div className="space-y-4">
                  {spa.pricing.map((item, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.title}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow sticky top-24">
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 mb-6 h-12 text-lg" 
                onClick={() => setShowBookingModal(true)}
                data-testid="book-now-detail-button"
              >
                Book Now
              </Button>

              {/* Contact Info */}
              {spa.contact && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                  
                  {spa.contact.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-3" />
                      <span className="text-sm">{spa.contact.phone}</span>
                    </div>
                  )}
                  
                  {spa.contact.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-3" />
                      <span className="text-sm">{spa.contact.email}</span>
                    </div>
                  )}
                  
                  {spa.contact.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="w-4 h-4 mr-3" />
                      <a href={spa.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}

                  {/* Social Media */}
                  <div className="flex space-x-4 pt-4">
                    {spa.contact.facebook && (
                      <a href={spa.contact.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-emerald-600">
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {spa.contact.twitter && (
                      <a href={spa.contact.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-emerald-600">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {spa.contact.instagram && (
                      <a href={spa.contact.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-emerald-600">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        open={showBookingModal} 
        onClose={() => setShowBookingModal(false)} 
        prefilledSpa={spa}
      />
    </div>
  );
}
