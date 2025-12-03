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
    customerEmail: "",
    spaId: "",
    spaName: "",
    service: "",
    datetime: "",
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [spas, setSpas] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedSpaData, setSelectedSpaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeError, setTimeError] = useState("");

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
      setSelectedSpaData(prefilledSpa);
    }
  }, [prefilledSpa]);

  // Validate time against store hours
  const validateBookingTime = (selectedDate, selectedTime) => {
    if (!selectedSpaData || !selectedDate || !selectedTime) {
      setTimeError("");
      return true;
    }

    const bookingDate = new Date(selectedDate);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday

    // Check if booking is on Sunday and spa is closed on Sunday
    if (dayOfWeek === 0 && selectedSpaData.storeHours?.sundayClosed) {
      setTimeError("This spa is closed on Sundays. Please select another day.");
      return false;
    }

    // Validate time is within store hours
    if (
      selectedSpaData.storeHours?.openingTime &&
      selectedSpaData.storeHours?.closingTime
    ) {
      const openingTime = selectedSpaData.storeHours.openingTime;
      const closingTime = selectedSpaData.storeHours.closingTime;

      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const openingMinutes = timeToMinutes(openingTime);
      const closingMinutes = timeToMinutes(closingTime);
      const bookingMinutes = timeToMinutes(selectedTime);

      if (bookingMinutes < openingMinutes || bookingMinutes >= closingMinutes) {
        setTimeError(
          `Booking time must be between ${openingTime} and ${closingTime}. This spa is open from ${openingTime} to ${closingTime}.`
        );
        return false;
      }
    }

    setTimeError("");
    return true;
  };

  // Update datetime when date or time changes
  useEffect(() => {
    if (date && time) {
      const datetimeString = `${date}T${time}`;
      setFormData((prev) => ({ ...prev, datetime: datetimeString }));
      // Validate time
      validateBookingTime(date, time);
    } else {
      setFormData((prev) => ({ ...prev, datetime: "" }));
      setTimeError("");
    }
  }, [date, time, selectedSpaData]);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      const userData = response.data.user;
      setUser(userData);
      setFormData((prev) => ({
        ...prev,
        customerName: userData.name,
        customerPhone: userData.phone,
        customerEmail: userData.email || "",
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
        // Fetch full spa details including store hours
        try {
          const response = await axios.get(`/api/spas/${selectedSpa._id}`);
          const fullSpaData = response.data.spa;
          setSelectedSpaData(fullSpaData);
          setFormData((prev) => ({
            ...prev,
            spaId: fullSpaData._id,
            spaName: fullSpaData.title,
            service: "",
          }));
          setServices(fullSpaData.services || []);
        } catch (error) {
          console.error("Failed to fetch spa details:", error);
          // Fallback to basic data
          setSelectedSpaData(selectedSpa);
          setFormData((prev) => ({
            ...prev,
            spaId: selectedSpa._id,
            spaName: selectedSpa.title,
            service: "",
          }));
          setServices(selectedSpa.services || []);
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        spaId: "",
        spaName: "",
        service: "",
      }));
      setServices([]);
      setSelectedSpaData(null);
      setTimeError("");
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

    // Validate booking time before submitting
    if (!validateBookingTime(date, time)) {
      toast.error(timeError);
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
      const emailMessage = formData.customerEmail
        ? " Check your email and WhatsApp for confirmation."
        : " Check your WhatsApp for confirmation.";
      toast.success("Booking confirmed!" + emailMessage);
      onClose();
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
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
        className="max-w-2xl max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto"
        data-testid="booking-modal"
      >
        <DialogHeader className="pt-2 sm:pt-0">
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
              placeholder="Enter your phone number"
              required
              data-testid="booking-phone-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address{" "}
            </label>
            <Input
              type="email"
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
              placeholder="Enter your email"
              data-testid="booking-email-input"
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
                  onChange={(e) => {
                    setDate(e.target.value);
                    // Re-validate when date changes
                    if (e.target.value && time) {
                      validateBookingTime(e.target.value, time);
                    }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  data-testid="booking-date-input"
                  className={`w-full ${
                    timeError && timeError.includes("Sunday")
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>
              <div>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    // Re-validate when time changes
                    if (date && e.target.value) {
                      validateBookingTime(date, e.target.value);
                    }
                  }}
                  min={
                    selectedSpaData?.storeHours?.openingTime
                      ? selectedSpaData.storeHours.openingTime
                      : undefined
                  }
                  max={
                    selectedSpaData?.storeHours?.closingTime
                      ? selectedSpaData.storeHours.closingTime
                      : undefined
                  }
                  required
                  data-testid="booking-time-input"
                  className={`w-full ${
                    timeError && !timeError.includes("Sunday")
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>
            </div>
            {timeError && (
              <p className="text-red-500 text-xs mt-1">{timeError}</p>
            )}
            {selectedSpaData?.storeHours && (
              <p className="text-gray-500 text-xs mt-1">
                Store hours: {selectedSpaData.storeHours.openingTime} -{" "}
                {selectedSpaData.storeHours.closingTime}
                {selectedSpaData.storeHours.sundayClosed &&
                  " (Closed on Sunday)"}
              </p>
            )}
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
