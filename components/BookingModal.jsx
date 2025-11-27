"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "react-select";
import { toast } from "sonner";
import axios from "axios";

export default function BookingModal({ open, onClose, prefilledSpa = null }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    spaId: "",
    spaName: "",
    service: "",
    datetime: "",
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [spas, setSpas] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUser();
      if (!prefilledSpa) {
        fetchSpas();
      }
      // Reset form when modal opens
      setDate("");
      setTime("");
    }
  }, [open, prefilledSpa]);

  useEffect(() => {
    if (prefilledSpa) {
      setFormData((prev) => ({
        ...prev,
        spaId: prefilledSpa._id,
        spaName: prefilledSpa.title,
      }));
      setServices(prefilledSpa.services || []);
    }
  }, [prefilledSpa]);

  // Update datetime when date or time changes
  useEffect(() => {
    if (date && time) {
      const datetimeString = `${date}T${time}`;
      setFormData((prev) => ({ ...prev, datetime: datetimeString }));
    } else {
      setFormData((prev) => ({ ...prev, datetime: "" }));
    }
  }, [date, time]);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      const userData = response.data.user;
      setUser(userData);
      setFormData((prev) => ({
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
      const response = await axios.get("/api/spas?limit=100");
      setSpas(response.data.spas);
    } catch (error) {
      console.error("Failed to fetch spas:", error);
    }
  };

  const handleSpaChange = async (selectedOption) => {
    if (selectedOption) {
      const selectedSpa = spas.find((s) => s._id === selectedOption.value);
      if (selectedSpa) {
        setFormData((prev) => ({
          ...prev,
          spaId: selectedSpa._id,
          spaName: selectedSpa.title,
          service: "",
        }));
        setServices(selectedSpa.services || []);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        spaId: "",
        spaName: "",
        service: "",
      }));
      setServices([]);
    }
  };

  const handleServiceChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({ ...prev, service: selectedOption.value }));
    } else {
      setFormData((prev) => ({ ...prev, service: "" }));
    }
  };

  // Transform spas to react-select format
  const spaOptions = spas.map((spa) => ({
    value: spa._id,
    label: spa.title,
  }));

  // If prefilledSpa is provided, add it to options if not already present
  const allSpaOptions =
    prefilledSpa && !spaOptions.find((opt) => opt.value === prefilledSpa._id)
      ? [{ value: prefilledSpa._id, label: prefilledSpa.title }, ...spaOptions]
      : spaOptions;

  // Transform services to react-select format
  const serviceOptions = services.map((service) => {
    if (typeof service === "string") {
      return { value: service, label: service };
    }
    return {
      value: service.value || service.name || String(service),
      label: service.name || service.label || String(service),
    };
  });

  // Get selected spa option
  const selectedSpaOption = allSpaOptions.find(
    (option) => option.value === formData.spaId
  );

  // Get selected service option
  const selectedServiceOption = serviceOptions.find(
    (option) => option.value === formData.service
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.spaId ||
      !formData.service ||
      !formData.datetime
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Parse datetime to separate date and time for API compatibility
      const datetime = new Date(formData.datetime);
      const date = datetime.toISOString().split("T")[0];
      const time = datetime.toTimeString().split(" ")[0].slice(0, 5); // HH:MM format

      const bookingData = {
        ...formData,
        date,
        time,
      };
      delete bookingData.datetime;

      const response = await axios.post("/api/bookings", bookingData);
      toast.success("Booking confirmed! Check your WhatsApp for confirmation.");
      onClose();
      setFormData({
        customerName: "",
        customerPhone: "",
        spaId: "",
        spaName: "",
        service: "",
        datetime: "",
      });
      setDate("");
      setTime("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onClose={onClose}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="booking-modal"
      >
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Book Your Spa Appointment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.customerName}
              onChange={(e) =>
                setFormData({ ...formData, customerName: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, customerPhone: e.target.value })
              }
              placeholder="+91 1234567890"
              required
              data-testid="booking-phone-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Spa <span className="text-red-500">*</span>
            </label>
            <Select
              options={allSpaOptions}
              value={selectedSpaOption}
              onChange={handleSpaChange}
              placeholder="Select a spa..."
              isDisabled={!!prefilledSpa}
              isSearchable={true}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
              data-testid="booking-spa-select"
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  minHeight: "40px",
                  borderColor: state.isFocused ? "#10b981" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
                  "&:hover": {
                    borderColor: state.isFocused ? "#10b981" : "#9ca3af",
                  },
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isSelected
                    ? "#10b981"
                    : state.isFocused
                      ? "#d1fae5"
                      : "white",
                  color: state.isSelected ? "white" : "#111827",
                  "&:hover": {
                    backgroundColor: state.isSelected ? "#10b981" : "#d1fae5",
                  },
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Service <span className="text-red-500">*</span>
            </label>
            <Select
              options={serviceOptions}
              value={selectedServiceOption}
              onChange={handleServiceChange}
              placeholder="Select a service..."
              isDisabled={!formData.spaId}
              isSearchable={true}
              isClearable={true}
              className="react-select-container"
              classNamePrefix="react-select"
              data-testid="booking-service-select"
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  minHeight: "40px",
                  borderColor: state.isFocused ? "#10b981" : "#d1d5db",
                  boxShadow: state.isFocused ? "0 0 0 1px #10b981" : "none",
                  "&:hover": {
                    borderColor: state.isFocused ? "#10b981" : "#9ca3af",
                  },
                }),
                option: (baseStyles, state) => ({
                  ...baseStyles,
                  backgroundColor: state.isSelected
                    ? "#10b981"
                    : state.isFocused
                      ? "#d1fae5"
                      : "white",
                  color: state.isSelected ? "white" : "#111827",
                  "&:hover": {
                    backgroundColor: state.isSelected ? "#10b981" : "#d1fae5",
                  },
                }),
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  data-testid="booking-date-input"
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  data-testid="booking-time-input"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="booking-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              data-testid="booking-submit-button"
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
