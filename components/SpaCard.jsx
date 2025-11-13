'use client';

import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SpaCard({ spa }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300" data-testid={`spa-card-${spa._id}`}>
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-emerald-200 to-teal-200">
        {spa.gallery?.[0] ? (
          <img
            src={spa.gallery[0]}
            alt={spa.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-emerald-600 font-semibold text-xl">
            {spa.title?.charAt(0)}
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid={`spa-title-${spa._id}`}>
          {spa.title}
        </h3>
        
        <div className="flex items-start text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
          <span className="text-sm">
            {spa.location?.address || spa.location?.region || 'Location not specified'}
          </span>
        </div>

        {spa.services?.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {spa.services.slice(0, 3).map((service, index) => (
                <span
                  key={index}
                  className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full"
                >
                  {service}
                </span>
              ))}
              {spa.services.length > 3 && (
                <span className="text-xs text-gray-500">+{spa.services.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        <Link href={`/spa/${spa._id}`}>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700" data-testid={`view-details-${spa._id}`}>
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
