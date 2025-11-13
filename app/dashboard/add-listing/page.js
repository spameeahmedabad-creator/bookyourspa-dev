'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { PlusCircle, Trash2 } from 'lucide-react';

const AVAILABLE_SERVICES = [
  'Couple Massage', 'Deep Tissue Massage', 'Dry Massage', 'Four Hand Massage',
  'Hammam Massage', 'Hot Stone Massage', 'Jacuzzi Massage', 'Oil Massage',
  'Potli Massage', 'Shirodhara Massage', 'Swedish Massage'
];

export default function AddListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    logo: '',
    services: [],
    location: {
      address: '',
      region: '',
      longitude: '',
      latitude: ''
    },
    gallery: [''],
    description: '',
    contact: {
      phone: '',
      website: '',
      email: '',
      facebook: '',
      twitter: '',
      instagram: '',
      skype: ''
    },
    pricing: [{
      image: '',
      title: '',
      description: '',
      price: '',
      multiplier: 'per session',
      quantity: 1
    }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location.region || formData.services.length === 0) {
      toast.error('Please fill in required fields: Title, Region, and at least one Service');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/spas', {
        ...formData,
        gallery: formData.gallery.filter(g => g.trim() !== ''),
        pricing: formData.pricing.filter(p => p.title && p.price)
      });
      
      toast.success('Spa listing created successfully!');
      router.push(`/spa/${response.data.spa._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const addGalleryImage = () => {
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, '']
    }));
  };

  const updateGalleryImage = (index, value) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = value;
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const addPricingItem = () => {
    setFormData(prev => ({
      ...prev,
      pricing: [...prev.pricing, {
        image: '',
        title: '',
        description: '',
        price: '',
        multiplier: 'per session',
        quantity: 1
      }]
    }));
  };

  const updatePricingItem = (index, field, value) => {
    const newPricing = [...formData.pricing];
    newPricing[index][field] = value;
    setFormData(prev => ({ ...prev, pricing: newPricing }));
  };

  const removePricingItem = (index) => {
    setFormData(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8" data-testid="add-listing-page">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Spa Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Spa name"
                  required
                  data-testid="listing-title-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <Input
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  placeholder="https://example.com/logo.png"
                  data-testid="listing-logo-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_SERVICES.map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your spa and services..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="listing-description-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <Input
                  value={formData.location.address}
                  onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region / City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.location.region}
                  onChange={(e) => setFormData({...formData, location: {...formData.location, region: e.target.value}})}
                  placeholder="e.g., Ahmedabad, Gandhinagar"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.location.longitude}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, longitude: e.target.value}})}
                    placeholder="72.5714"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.location.latitude}
                    onChange={(e) => setFormData({...formData, location: {...formData.location, latitude: e.target.value}})}
                    placeholder="23.0225"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Gallery Images</h2>
                <Button type="button" size="sm" onClick={addGalleryImage}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </div>
              
              {formData.gallery.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => updateGalleryImage(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.gallery.length > 1 && (
                    <Button type="button" size="icon" variant="destructive" onClick={() => removeGalleryImage(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <Input
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, phone: e.target.value}})}
                    placeholder="+91 1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, email: e.target.value}})}
                    placeholder="contact@spa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <Input
                    value={formData.contact.website}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, website: e.target.value}})}
                    placeholder="https://spa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <Input
                    value={formData.contact.facebook}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, facebook: e.target.value}})}
                    placeholder="https://facebook.com/spa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <Input
                    value={formData.contact.twitter}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, twitter: e.target.value}})}
                    placeholder="https://twitter.com/spa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <Input
                    value={formData.contact.instagram}
                    onChange={(e) => setFormData({...formData, contact: {...formData.contact, instagram: e.target.value}})}
                    placeholder="https://instagram.com/spa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
                <Button type="button" size="sm" onClick={addPricingItem}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              {formData.pricing.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Item {index + 1}</h3>
                    {formData.pricing.length > 1 && (
                      <Button type="button" size="sm" variant="destructive" onClick={() => removePricingItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <Input
                        value={item.title}
                        onChange={(e) => updatePricingItem(index, 'title', e.target.value)}
                        placeholder="Service name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updatePricingItem(index, 'price', e.target.value)}
                        placeholder="1000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <Input
                        value={item.description}
                        onChange={(e) => updatePricingItem(index, 'description', e.target.value)}
                        placeholder="Service description"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={() => router.push('/')} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700" data-testid="submit-listing-button">
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
