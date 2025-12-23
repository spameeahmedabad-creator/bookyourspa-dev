"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from "axios";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Tag,
  Calendar,
  Users,
  DollarSign,
  Megaphone,
} from "lucide-react";

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent",
    value: "",
    scope: "spa",
    spaId: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    perUserLimit: "1",
    minOrderAmount: "0",
    // Banner settings
    showBanner: false,
    bannerText: "",
    bannerColor: "emerald",
  });

  useEffect(() => {
    fetchUserAndData();
  }, []);

  const fetchUserAndData = async () => {
    try {
      setLoading(true);
      const meRes = await axios.get("/api/auth/me");
      const userData = meRes.data.user;
      setUser(userData);

      if (
        !userData ||
        (userData.role !== "admin" && userData.role !== "spa_owner")
      ) {
        toast.error("Access denied");
        router.push("/");
        return;
      }

      // Fetch coupons
      const couponsRes = await axios.get("/api/coupons");
      setCoupons(couponsRes.data.coupons || []);

      // Fetch spas if user is spa owner
      if (userData.role === "spa_owner") {
        const spasRes = await axios.get(
          `/api/spas?ownerId=${userData.id}&limit=1000`
        );
        setSpas(spasRes.data.spas || []);
      } else if (userData.role === "admin") {
        // Admin can see all spas
        const spasRes = await axios.get("/api/spas?limit=1000");
        setSpas(spasRes.data.spas || []);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login");
        router.push("/login");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "percent",
      value: "",
      scope: "spa",
      spaId: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      perUserLimit: "1",
      minOrderAmount: "0",
      showBanner: false,
      bannerText: "",
      bannerColor: "emerald",
    });
    setShowCreateModal(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      scope: coupon.scope,
      spaId: coupon.spaId?._id || coupon.spaId || "",
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().split("T")[0]
        : "",
      endDate: coupon.endDate
        ? new Date(coupon.endDate).toISOString().split("T")[0]
        : "",
      usageLimit: coupon.usageLimit?.toString() || "",
      perUserLimit: coupon.perUserLimit?.toString() || "1",
      minOrderAmount: coupon.minOrderAmount?.toString() || "0",
      showBanner: coupon.showBanner || false,
      bannerText: coupon.bannerText || "",
      bannerColor: coupon.bannerColor || "emerald",
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.value || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.scope === "spa" && !formData.spaId) {
      toast.error("Please select a spa");
      return;
    }

    if (
      formData.type === "percent" &&
      (formData.value < 0 || formData.value > 100)
    ) {
      toast.error("Percent discount must be between 0 and 100");
      return;
    }

    try {
      if (editingCoupon) {
        // Update coupon
        await axios.put(`/api/coupons/${editingCoupon._id}`, {
          isActive: editingCoupon.isActive,
          startDate: formData.startDate || undefined,
          endDate: formData.endDate,
          usageLimit: formData.usageLimit || null,
          perUserLimit: formData.perUserLimit,
          minOrderAmount: formData.minOrderAmount,
          showBanner: formData.showBanner,
          bannerText: formData.bannerText,
          bannerColor: formData.bannerColor,
        });
        toast.success("Coupon updated successfully");
      } else {
        // Create coupon
        await axios.post("/api/coupons", {
          ...formData,
          value: parseFloat(formData.value),
          usageLimit: formData.usageLimit
            ? parseInt(formData.usageLimit)
            : null,
          perUserLimit: parseInt(formData.perUserLimit),
          minOrderAmount: parseFloat(formData.minOrderAmount),
        });
        toast.success("Coupon created successfully");
      }
      setShowCreateModal(false);
      fetchUserAndData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save coupon");
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await axios.put(`/api/coupons/${coupon._id}`, {
        isActive: !coupon.isActive,
      });
      toast.success(`Coupon ${!coupon.isActive ? "activated" : "deactivated"}`);
      fetchUserAndData();
    } catch (error) {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await axios.delete(`/api/coupons/${couponId}`);
      toast.success("Coupon deleted successfully");
      fetchUserAndData();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete coupon");
    }
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    if (!coupon.isActive) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
          Inactive
        </span>
      );
    }
    if (now < new Date(coupon.startDate)) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
          Upcoming
        </span>
      );
    }
    if (now > new Date(coupon.endDate)) {
      return (
        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
          Expired
        </span>
      );
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">
          Limit Reached
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs rounded">
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
            <p className="text-gray-600 mt-2">
              Manage discount coupons for your spas
            </p>
          </div>
          {user?.role === "admin" || user?.role === "spa_owner" ? (
            <Button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          ) : null}
        </div>

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No coupons found. Create your first coupon to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {coupons.map((coupon) => (
              <Card
                key={coupon._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {coupon.code}
                        </h3>
                        {getStatusBadge(coupon)}
                        {coupon.showBanner && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded flex items-center gap-1">
                            <Megaphone className="w-3 h-3" />
                            Banner
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {coupon.type === "percent"
                              ? `${coupon.value}% off`
                              : `₹${coupon.value} off`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          <span>
                            {coupon.scope === "global" ? "Global" : "Spa"}
                          </span>
                        </div>
                        {coupon.scope === "spa" && coupon.spaId && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">
                              {coupon.spaId.title || "Spa"}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {coupon.usedCount}/{coupon.usageLimit || "∞"} used
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Valid: {new Date(
                          coupon.startDate
                        ).toLocaleDateString()}{" "}
                        - {new Date(coupon.endDate).toLocaleDateString()}
                        {coupon.minOrderAmount > 0 && (
                          <span className="ml-3">
                            Min: ₹{coupon.minOrderAmount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(coupon)}
                      >
                        {coupon.isActive ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {user?.role === "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="SAVE20"
                      required
                      disabled={!!editingCoupon}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={!!editingCoupon}
                    >
                      <option value="percent">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder={formData.type === "percent" ? "20" : "500"}
                    min="0"
                    max={formData.type === "percent" ? "100" : undefined}
                    required
                    disabled={!!editingCoupon}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === "percent"
                      ? "Enter percentage (0-100)"
                      : "Enter amount in ₹"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scope <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.scope}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scope: e.target.value,
                        spaId: "",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={!!editingCoupon}
                  >
                    {user?.role === "admin" && (
                      <option value="global">Global (All Spas)</option>
                    )}
                    <option value="spa">Spa Specific</option>
                  </select>
                </div>

                {formData.scope === "spa" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Spa <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.spaId}
                      onChange={(e) =>
                        setFormData({ ...formData, spaId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      disabled={!!editingCoupon}
                    >
                      <option value="">Select a spa</option>
                      {spas.map((spa) => (
                        <option key={spa._id} value={spa._id}>
                          {spa.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <Input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) =>
                        setFormData({ ...formData, usageLimit: e.target.value })
                      }
                      placeholder="Unlimited"
                      min="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for unlimited
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Per User Limit
                    </label>
                    <Input
                      type="number"
                      value={formData.perUserLimit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          perUserLimit: e.target.value,
                        })
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Order (₹)
                    </label>
                    <Input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: e.target.value,
                        })
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Promotional Banner Settings */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    Promotional Banner Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="showBanner"
                        checked={formData.showBanner}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            showBanner: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="showBanner"
                        className="text-sm text-gray-700"
                      >
                        Show promotional banner on website
                      </label>
                    </div>

                    {formData.showBanner && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Custom Banner Text (optional)
                          </label>
                          <Input
                            value={formData.bannerText}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                bannerText: e.target.value,
                              })
                            }
                            placeholder="🎉 20% OFF! Use code: SAVE20"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty for auto-generated text
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Banner Color
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              {
                                value: "emerald",
                                label: "Emerald",
                                bg: "bg-emerald-500",
                              },
                              { value: "red", label: "Red", bg: "bg-red-500" },
                              {
                                value: "purple",
                                label: "Purple",
                                bg: "bg-purple-500",
                              },
                              {
                                value: "orange",
                                label: "Orange",
                                bg: "bg-orange-500",
                              },
                              {
                                value: "blue",
                                label: "Blue",
                                bg: "bg-blue-500",
                              },
                              {
                                value: "pink",
                                label: "Pink",
                                bg: "bg-pink-500",
                              },
                            ].map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() =>
                                  setFormData({
                                    ...formData,
                                    bannerColor: color.value,
                                  })
                                }
                                className={`px-3 py-1.5 rounded-full text-xs font-medium text-white ${color.bg} ${
                                  formData.bannerColor === color.value
                                    ? "ring-2 ring-offset-2 ring-gray-400"
                                    : "opacity-60 hover:opacity-100"
                                }`}
                              >
                                {color.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {editingCoupon ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
