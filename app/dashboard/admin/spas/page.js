"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { Edit2, Trash2, Building2, MapPin } from "lucide-react";

export default function AdminSpasPage() {
  const router = useRouter();
  const [spas, setSpas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSpa, setSelectedSpa] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSpas();
  }, []);

  const fetchSpas = async () => {
    try {
      setLoading(true);
      // Fetch all spas without pagination limit
      const response = await axios.get("/api/spas?limit=1000");
      setSpas(response.data.spas || []);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Admin access required");
      } else {
        toast.error("Failed to load spas");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (spaId) => {
    router.push(`/dashboard/add-listing?edit=${spaId}`);
  };

  const handleDeleteClick = (spa) => {
    setSelectedSpa(spa);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSpa) return;

    try {
      setDeleting(true);
      await axios.delete(`/api/spas/${selectedSpa._id}`);
      toast.success("Spa deleted successfully");
      setShowDeleteModal(false);
      setSelectedSpa(null);
      fetchSpas();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete spa");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
        data-testid="admin-spas-page"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Spa Management</h1>
          <p className="text-gray-600 mt-2">View and manage all spa listings</p>
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

        {/* Spas Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Spas</CardTitle>
          </CardHeader>
          <CardContent>
            {spas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No spas found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-left py-3 px-4">Services</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spas.map((spa) => (
                      <tr key={spa._id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{spa.title}</td>
                        <td className="py-4 px-4 text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>
                              {spa.location?.region ||
                                spa.location?.address ||
                                "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {spa.services && spa.services.length > 0
                            ? `${spa.services.length} service${
                                spa.services.length > 1 ? "s" : ""
                              }`
                            : "No services"}
                        </td>
                        <td className="py-4 px-4 text-gray-600 text-sm">
                          {new Date(spa.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(spa._id)}
                              data-testid={`edit-spa-${spa._id}`}
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClick(spa)}
                              data-testid={`delete-spa-${spa._id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent data-testid="delete-spa-modal">
          <DialogHeader>
            <DialogTitle>Delete Spa</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this spa? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {selectedSpa && (
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <p className="text-sm text-gray-600">Spa Name</p>
              <p className="text-lg font-semibold">{selectedSpa.title}</p>
              {selectedSpa.location?.region && (
                <p className="text-sm text-gray-600 mt-1">
                  Location: {selectedSpa.location.region}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedSpa(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
