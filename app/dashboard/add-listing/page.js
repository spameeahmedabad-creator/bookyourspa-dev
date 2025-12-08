"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { PlusCircle, Trash2 } from "lucide-react";
import { validatePhone, formatPhoneInput } from "@/lib/phone-validation";
import {
  validateEmail,
  validateWebsite,
  validateGallery,
} from "@/lib/form-validation";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import CloudinaryMultiUpload from "@/components/CloudinaryMultiUpload";
import Select from "react-select";

const REGION_OPTIONS = [
  { value: "Ahmedabad", label: "Ahmedabad" },
  { value: "Gandhinagar", label: "Gandhinagar" },
];

const AVAILABLE_SERVICES = [
  "Couple Massage",
  "Deep Tissue Massage",
  "Dry Massage",
  "Four Hand Massage",
  "Hammam Massage",
  "Hot Stone Massage",
  "Jacuzzi Massage",
  "Oil Massage",
  "Potli Massage",
  "Shirodhara Massage",
  "Swedish Massage",
];

const STORAGE_KEY = "bookyourspa_add_listing_form";

function AddListingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSpaId = searchParams.get("edit");
  const isEditMode = !!editSpaId;
  const [loading, setLoading] = useState(false);
  const [fetchingSpa, setFetchingSpa] = useState(isEditMode);
  const [formInitialized, setFormInitialized] = useState(false);
  const [errors, setErrors] = useState({
    phone: "",
    email: "",
    website: "",
    gallery: "",
  });

  // Restore scroll on page load (in case it was locked from Cloudinary widget)
  useEffect(() => {
    const restoreScroll = () => {
      if (document.body) {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.height = "";
        document.body.style.width = "";
      }
      if (document.documentElement) {
        document.documentElement.style.overflow = "";
        document.documentElement.style.position = "";
      }
      // Scroll to top to ensure page is accessible
      window.scrollTo(0, 0);
    };

    // Restore scroll immediately on mount
    restoreScroll();

    // Also restore after a short delay to catch any delayed widget cleanup
    const timeout = setTimeout(restoreScroll, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Fetch spa data if in edit mode
  useEffect(() => {
    if (isEditMode && editSpaId) {
      fetchSpaData(editSpaId);
    }
  }, [isEditMode, editSpaId]);

  const fetchSpaData = async (spaId) => {
    try {
      setFetchingSpa(true);
      const response = await axios.get(`/api/spas/${spaId}`);
      const spa = response.data.spa;

      // Pre-populate form with spa data
      setFormData({
        title: spa.title || "",
        logo: spa.logo || "",
        services: spa.services || [],
        location: {
          address: spa.location?.address || "",
          region: spa.location?.region || "",
          longitude: spa.location?.longitude?.toString() || "",
          latitude: spa.location?.latitude?.toString() || "",
          googleMapsLink: spa.location?.googleMapsLink || "",
        },
        gallery: spa.gallery && spa.gallery.length > 0 ? spa.gallery : [""],
        description: spa.description || "",
        contact: {
          phone: spa.contact?.phone || "",
          website: spa.contact?.website || "",
          email: spa.contact?.email || "",
          facebook: spa.contact?.facebook || "",
          whatsapp: spa.contact?.whatsapp || "",
          instagram: spa.contact?.instagram || "",
          skype: spa.contact?.skype || "",
        },
        storeHours: {
          is24Hours: spa.storeHours?.is24Hours || false,
          openingTime: spa.storeHours?.openingTime || "09:00",
          closingTime: spa.storeHours?.closingTime || "21:00",
          sundayClosed: spa.storeHours?.sundayClosed || false,
        },
        pricing:
          spa.pricing && spa.pricing.length > 0
            ? spa.pricing.map((p) => ({
                image: p.image || "",
                title: p.title || "",
                description: p.description || "",
                price: p.price?.toString() || "",
                multiplier: p.multiplier || "per session",
                quantity: p.quantity || 1,
              }))
            : [
                {
                  image: "",
                  title: "",
                  description: "",
                  price: "",
                  multiplier: "per session",
                  quantity: 1,
                },
              ],
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load spa data");
      router.push("/dashboard/admin/spas");
    } finally {
      setFetchingSpa(false);
    }
  };

  // Initialize form data - try to load from sessionStorage first
  const getInitialFormData = () => {
    const defaultData = {
      title: "",
      logo: "",
      services: [],
      location: {
        address: "",
        region: "",
        longitude: "",
        latitude: "",
        googleMapsLink: "",
      },
      gallery: [""],
      description: "",
      contact: {
        phone: "",
        website: "",
        email: "",
        facebook: "",
        whatsapp: "",
        instagram: "",
        skype: "",
      },
      storeHours: {
        is24Hours: false,
        openingTime: "09:00",
        closingTime: "21:00",
        sundayClosed: false,
      },
      pricing: [
        {
          image: "",
          title: "",
          description: "",
          price: "",
          multiplier: "per session",
          quantity: 1,
        },
      ],
    };

    // Only load from storage on client side and not in edit mode
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Check if saved data is for the same mode (edit vs create)
          if (parsed._editSpaId === editSpaId) {
            // Remove the metadata field before returning
            const { _editSpaId, ...formData } = parsed;
            return formData;
          }
        }
      } catch (e) {
        console.error("Error loading saved form data:", e);
      }
    }
    return defaultData;
  };

  const [formData, setFormData] = useState(getInitialFormData);

  // Save form data to sessionStorage whenever it changes (debounced)
  useEffect(() => {
    if (!formInitialized) return;

    const timeoutId = setTimeout(() => {
      try {
        // Save with metadata about which spa we're editing (null for new)
        const dataToSave = {
          ...formData,
          _editSpaId: editSpaId,
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Error saving form data:", e);
      }
    }, 300); // Debounce by 300ms

    return () => clearTimeout(timeoutId);
  }, [formData, editSpaId, formInitialized]);

  // Mark form as initialized after first render
  useEffect(() => {
    setFormInitialized(true);
  }, []);

  // Clear saved form data on successful submission
  const clearSavedFormData = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Error clearing saved form data:", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      phone: "",
      email: "",
      website: "",
      gallery: "",
    });

    // Validate required fields
    if (
      !formData.title ||
      !formData.location.region ||
      formData.services.length === 0
    ) {
      toast.error(
        "Please fill in required fields: Title, Region, and at least one Service"
      );
      return;
    }

    // Validate phone (required)
    if (!formData.contact.phone || formData.contact.phone.trim() === "") {
      setErrors((prev) => ({ ...prev, phone: "Phone number is required" }));
      toast.error("Phone number is required");
      return;
    }
    const phoneValidation = validatePhone(formData.contact.phone, "IN");
    if (!phoneValidation.isValid) {
      setErrors((prev) => ({ ...prev, phone: phoneValidation.error }));
      toast.error(`Phone: ${phoneValidation.error}`);
      return;
    }

    // Validate email (required)
    if (!formData.contact.email || formData.contact.email.trim() === "") {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      toast.error("Email is required");
      return;
    }
    const emailValidation = validateEmail(formData.contact.email);
    if (!emailValidation.isValid) {
      setErrors((prev) => ({ ...prev, email: emailValidation.error }));
      toast.error(`Email: ${emailValidation.error}`);
      return;
    }

    // Validate website (if provided)
    if (formData.contact.website && formData.contact.website.trim() !== "") {
      const websiteValidation = validateWebsite(formData.contact.website);
      if (!websiteValidation.isValid) {
        setErrors((prev) => ({ ...prev, website: websiteValidation.error }));
        toast.error(`Website: ${websiteValidation.error}`);
        return;
      }
    }

    // Gallery validation removed - no longer required

    setLoading(true);
    try {
      // Format phone if provided
      let contactData = { ...formData.contact };
      if (contactData.phone && contactData.phone.trim() !== "") {
        const phoneValidation = validatePhone(contactData.phone, "IN");
        if (phoneValidation.isValid && phoneValidation.formatted) {
          contactData.phone = phoneValidation.formatted;
        }
      }

      // Format website if provided
      if (contactData.website && contactData.website.trim() !== "") {
        const websiteValidation = validateWebsite(contactData.website);
        if (websiteValidation.isValid && websiteValidation.formatted) {
          contactData.website = websiteValidation.formatted;
        }
      }

      // Convert location coordinates to numbers
      const locationData = {
        ...formData.location,
        latitude: formData.location.latitude
          ? parseFloat(formData.location.latitude)
          : undefined,
        longitude: formData.location.longitude
          ? parseFloat(formData.location.longitude)
          : undefined,
      };

      if (isEditMode) {
        // Update existing spa
        const response = await axios.put(`/api/spas/${editSpaId}`, {
          ...formData,
          location: locationData,
          contact: contactData,
          gallery: formData.gallery.filter((g) => g.trim() !== ""),
          pricing: formData.pricing.filter((p) => p.title && p.price),
        });

        clearSavedFormData(); // Clear saved data on success
        toast.success("Spa listing updated successfully!");
        router.push(`/spa/${response.data.spa._id}`);
      } else {
        // Create new spa
        const response = await axios.post("/api/spas", {
          ...formData,
          location: locationData,
          contact: contactData,
          gallery: formData.gallery.filter((g) => g.trim() !== ""),
          pricing: formData.pricing.filter((p) => p.title && p.price),
        });

        clearSavedFormData(); // Clear saved data on success
        toast.success("Spa listing created successfully!");
        router.push(`/spa/${response.data.spa._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const addGalleryImage = () => {
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ""],
    }));
  };

  const updateGalleryImage = (index, value) => {
    setFormData((prev) => {
      const newGallery = [...prev.gallery];
      newGallery[index] = value;
      return { ...prev, gallery: newGallery };
    });
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const addPricingItem = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: [
        ...prev.pricing,
        {
          image: "",
          title: "",
          description: "",
          price: "",
          multiplier: "per session",
          quantity: 1,
        },
      ],
    }));
  };

  const updatePricingItem = (index, field, value) => {
    const newPricing = [...formData.pricing];
    newPricing[index][field] = value;
    setFormData((prev) => ({ ...prev, pricing: newPricing }));
  };

  const removePricingItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div
        className="max-w-4xl mx-auto px-4 py-4 sm:py-8"
        data-testid="add-listing-page"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          {isEditMode ? "Edit Spa Listing" : "Add New Spa Listing"}
        </h1>

        {fetchingSpa && (
          <div className="mb-6 text-center text-gray-600">
            Loading spa data...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Primary Details: Title, Location & Photos */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Spa Details
              </h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Spa name"
                  required
                  data-testid="listing-title-input"
                />
              </div>

              {/* Location */}
              <div className="border-t pt-4 mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Location
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          address: e.target.value,
                        },
                      })
                    }
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region / City <span className="text-red-500">*</span>
                  </label>
                  <Select
                    options={REGION_OPTIONS}
                    value={
                      REGION_OPTIONS.find(
                        (option) => option.value === formData.location.region
                      ) || null
                    }
                    onChange={(selected) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          region: selected ? selected.value : "",
                        },
                      })
                    }
                    placeholder="Select Region / City"
                    isClearable={false}
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "40px",
                        borderColor: "#e5e7eb",
                        "&:hover": {
                          borderColor: "#d1d5db",
                        },
                      }),
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Location on Map
                  </label>
                  <Input
                    type="url"
                    value={formData.location.googleMapsLink}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: {
                          ...formData.location,
                          googleMapsLink: e.target.value,
                        },
                      })
                    }
                    placeholder="https://maps.app.goo.gl/2PA7PpUudmCTwq4SA"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Enter your Google Maps share link (e.g.,
                    https://maps.app.goo.gl/...)
                  </p>
                </div>
              </div>

              {/* Photos / Gallery */}
              <div className="border-t pt-4 mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Photos / Gallery
                </h3>

                <CloudinaryMultiUpload
                  values={formData.gallery}
                  onUpload={(urls) => {
                    setFormData((prev) => ({ ...prev, gallery: urls }));
                    // Clear error when user uploads images
                    if (errors.gallery) {
                      setErrors((prev) => ({ ...prev, gallery: "" }));
                    }
                  }}
                  buttonText="Upload Gallery Images"
                  showPreview={!isEditMode}
                />

                {errors.gallery && (
                  <p className="text-red-500 text-sm mt-1">{errors.gallery}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Additional Details
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <CloudinaryUpload
                  value={formData.logo}
                  onUpload={(url) =>
                    setFormData((prev) => ({ ...prev, logo: url }))
                  }
                  buttonText="Upload Logo"
                  showPreview={!isEditMode}
                />
                {/* Show Logo URL below */}
                {formData.logo && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Logo Cloudinary URL:
                    </p>
                    <p className="text-xs text-blue-700 break-all font-mono bg-white p-2 rounded border">
                      {formData.logo}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_SERVICES.map((service) => (
                    <label
                      key={service}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your spa and services..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="listing-description-input"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Store Hours
                </h3>

                {/* Open 24 Hours Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.storeHours.is24Hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeHours: {
                            ...formData.storeHours,
                            is24Hours: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Open 24 Hours
                    </span>
                  </label>
                  <p className="text-gray-500 text-xs mt-1 ml-6">
                    Check this if your spa operates 24 hours a day
                  </p>
                </div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${formData.storeHours.is24Hours ? "opacity-50" : ""}`}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Time{" "}
                      {!formData.storeHours.is24Hours && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <Input
                      type="time"
                      value={formData.storeHours.openingTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeHours: {
                            ...formData.storeHours,
                            openingTime: e.target.value,
                          },
                        })
                      }
                      disabled={formData.storeHours.is24Hours}
                      required={!formData.storeHours.is24Hours}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Time{" "}
                      {!formData.storeHours.is24Hours && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <Input
                      type="time"
                      value={formData.storeHours.closingTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeHours: {
                            ...formData.storeHours,
                            closingTime: e.target.value,
                          },
                        })
                      }
                      disabled={formData.storeHours.is24Hours}
                      required={!formData.storeHours.is24Hours}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.storeHours.sundayClosed}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          storeHours: {
                            ...formData.storeHours,
                            sundayClosed: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      Closed on Sunday
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => {
                      const formatted = formatPhoneInput(e.target.value, "IN");
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          phone: formatted,
                        },
                      });
                      // Clear error when user starts typing
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: "" }));
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur
                      if (
                        formData.contact.phone &&
                        formData.contact.phone.trim() !== ""
                      ) {
                        const phoneValidation = validatePhone(
                          formData.contact.phone,
                          "IN"
                        );
                        if (!phoneValidation.isValid) {
                          setErrors((prev) => ({
                            ...prev,
                            phone: phoneValidation.error,
                          }));
                        }
                      }
                    }}
                    placeholder="+91 98765 43210"
                    required
                    className={
                      errors.phone
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value },
                      });
                      // Clear error when user starts typing
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur
                      if (
                        formData.contact.email &&
                        formData.contact.email.trim() !== ""
                      ) {
                        const emailValidation = validateEmail(
                          formData.contact.email
                        );
                        if (!emailValidation.isValid) {
                          setErrors((prev) => ({
                            ...prev,
                            email: emailValidation.error,
                          }));
                        }
                      }
                    }}
                    placeholder="contact@spa.com"
                    required
                    className={
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    value={formData.contact.website}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          website: e.target.value,
                        },
                      });
                      // Clear error when user starts typing
                      if (errors.website) {
                        setErrors((prev) => ({ ...prev, website: "" }));
                      }
                    }}
                    onBlur={() => {
                      // Validate on blur if website is provided
                      if (
                        formData.contact.website &&
                        formData.contact.website.trim() !== ""
                      ) {
                        const websiteValidation = validateWebsite(
                          formData.contact.website
                        );
                        if (!websiteValidation.isValid) {
                          setErrors((prev) => ({
                            ...prev,
                            website: websiteValidation.error,
                          }));
                        }
                      }
                    }}
                    placeholder="https://spa.com"
                    className={
                      errors.website
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {errors.website && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.website}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Include http:// or https://
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <Input
                    value={formData.contact.facebook}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          facebook: e.target.value,
                        },
                      })
                    }
                    placeholder="https://facebook.com/spa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <Input
                    value={formData.contact.whatsapp}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          whatsapp: e.target.value,
                        },
                      })
                    }
                    placeholder="+91 98765 43210 or https://wa.me/919876543210"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Enter phone number or WhatsApp link
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <Input
                    value={formData.contact.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/spa"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>

              {formData.pricing.map((item, index) => (
                <div key={index} className="border p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Item {index + 1}</h3>
                    {formData.pricing.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removePricingItem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          updatePricingItem(index, "title", e.target.value)
                        }
                        placeholder="Service name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹)
                      </label>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updatePricingItem(index, "price", e.target.value)
                        }
                        placeholder="1000"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updatePricingItem(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Service description"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Item Button - Below pricing items */}
              <Button type="button" size="sm" onClick={addPricingItem}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || fetchingSpa}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              data-testid="submit-listing-button"
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Listing"
                  : "Create Listing"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <AddListingPageContent />
    </Suspense>
  );
}
