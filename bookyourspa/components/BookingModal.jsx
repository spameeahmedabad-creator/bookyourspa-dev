'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';

export default function BookingModal({ open, onClose, prefilledSpa = null }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    spaId: '',
    spaName: '',
    service: '',
    date: '',
    time: '',
  });
  const [spas, setSpas] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUser();
      if (!prefilledSpa) {
        fetchSpas();
      }
    }
  }, [open, prefilledSpa]);

  useEffect(() => {
    if (prefilledSpa) {
      setFormData(prev => ({
        ...prev,
        spaId: prefilledSpa._id,
        spaName: prefilledSpa.title,
      }));
      setServices(prefilledSpa.services || []);
    }
  }, [prefilledSpa]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const userData = response.data.user;
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        customerName: userData.name,
        customerPhone: userData.phone,
      }));
    } catch (error) {
      setUser(null);
    }
  };

  const fetchSpas = async () => {
    try {
      const response = await axios.get('/api/spas?limit=100');
      setSpas(response.data.spas);
    } catch (error) {
      console.error('Failed to fetch spas:', error);
    }
  };

  const handleSpaChange = async (spaId) => {
    const selectedSpa = spas.find(s => s._id === spaId);
    if (selectedSpa) {
      setFormData(prev => ({
        ...prev,
        spaId: selectedSpa._id,
        spaName: selectedSpa.title,
        service: '',
      }));
      setServices(selectedSpa.services || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.spaId || !formData.service || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/bookings', formData);
      toast.success('Booking confirmed! Check your WhatsApp for confirmation.');
      onClose();
      setFormData({
        customerName: '',
        customerPhone: '',
        spaId: '',
        spaName: '',
        service: '',
        date: '',
        time: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-md" data-testid="booking-modal">
        <DialogHeader>
          <DialogTitle>Book Your Spa Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Enter your name"
              required
              data-testid="booking-name-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="+91 1234567890"
              required
              data-testid="booking-phone-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Spa <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.spaId}
              onChange={(e) => handleSpaChange(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
              disabled={!!prefilledSpa}
              data-testid="booking-spa-select"
            >
              <option value="">Select a spa...</option>
              {spas.map((spa) => (
                <option key={spa._id} value={spa._id}>
                  {spa.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Service <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
              disabled={!formData.spaId}
              data-testid="booking-service-select"
            >
              <option value="">Select a service...</option>
              {services.map((service, index) => (
                <option key={index} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              required
              data-testid="booking-date-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              data-testid="booking-time-input"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" data-testid="booking-cancel-button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700" data-testid="booking-submit-button">
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
