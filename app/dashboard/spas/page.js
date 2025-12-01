"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { Building2, MapPin, Edit2, ExternalLink } from "lucide-react";

export default function OwnerSpasPage() {
  const router = useRouter();
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerSpas();
  }, []);

  const fetchOwnerSpas = async () => {
    try {
      setLoading(true);
      // Get current user to know their id
      const meRes = await axios.get("/api/auth/me");
      const user = meRes.data.user;

      if (!user || user.role !== "spa_owner") {
        toast.error("Spa owner access required");
        router.push("/");
        return;
      }

      const response = await axios.get(
        `/api/spas?ownerId=${user.id}&limit=1000`
      );
      setSpas(response.data.spas || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login to view your spas");
        router.push("/login");
      } else {
        toast.error("Failed to load your spas");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (spaId) => {
    router.push(`/dashboard/add-listing?edit=${spaId}`);
  };

  const handleViewPublic = (spaId) => {
    router.push(`/spa/${spaId}`);
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

      <div
        className="max-w-7xl mx-auto px-4 py-8"
        data-testid="owner-spas-page"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Spas</h1>
          <p className="text-gray-600 mt-2">
            View and manage spa listings associated with your account.
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spas</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {spas.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spas List */}
        {spas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              You don&apos;t have any spas yet. Contact admin to create a
              listing or assign a spa to your account.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Spa Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {spas.map((spa) => (
                  <div
                    key={spa._id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {spa.title}
                      </h2>
                      {spa.location?.region && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{spa.location.region}</span>
                        </p>
                      )}
                      {spa.services && spa.services.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {spa.services.length} service
                          {spa.services.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPublic(spa._id)}
                      >
                        View
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(spa._id)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit Listing
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
