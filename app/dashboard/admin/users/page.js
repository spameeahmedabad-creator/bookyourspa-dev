"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import {
  Edit2,
  Shield,
  Users as UsersIcon,
  Building2,
  ExternalLink,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSpas, setUserSpas] = useState([]);
  const [loadingSpas, setLoadingSpas] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/users");
      setUsers(response.data.users);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Admin access required");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (newRole) => {
    if (!selectedUser) return;

    try {
      const response = await axios.post("/api/admin/users/update-role", {
        userId: selectedUser._id,
        newRole,
      });
      toast.success(response.data.message);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update role");
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "spa_owner":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "spa_owner":
        return <UsersIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getAuthProviderLabel = (user) => {
    if (user.googleId) return "Google";
    if (user.email) return "Email";
    if (user.phone) return "Phone";
    return "Unknown";
  };

  const fetchUserSpas = async (userId) => {
    if (!userId) return;
    try {
      setLoadingSpas(true);
      const response = await axios.get(
        `/api/spas?ownerId=${userId}&limit=1000`
      );
      setUserSpas(response.data.spas || []);
    } catch (error) {
      console.error("Failed to fetch user spas:", error);
      setUserSpas([]);
    } finally {
      setLoadingSpas(false);
    }
  };

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
    // Fetch spas if user is a spa owner
    if (user.role === "spa_owner") {
      fetchUserSpas(user._id);
    } else {
      setUserSpas([]);
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
        data-testid="admin-users-page"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            View all registered users, see spa owners, and manage their roles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Spa Owners</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {users.filter((u) => u.role === "spa_owner").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Customers</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {users.filter((u) => u.role === "customer").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Contact</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Auth</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={`border-b hover:bg-gray-50 ${
                        user.role === "spa_owner" ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-medium">
                        <div className="text-gray-900">{user.name}</div>
                        {user.email && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {user.email}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        <div className="text-sm">{user.phone || "—"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role === "spa_owner"
                            ? "Spa Owner"
                            : user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {getAuthProviderLabel(user)}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(user)}
                          disabled={user.role === "admin"}
                          data-testid={`edit-user-${user._id}`}
                          title={
                            user.role === "admin"
                              ? "Cannot change role for admin users"
                              : "Change user role"
                          }
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Change Role
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent
          onClose={() => setShowEditModal(false)}
          data-testid="edit-role-modal"
        >
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">User</p>
                <p className="text-lg font-semibold">{selectedUser.name}</p>
                {selectedUser.email && (
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                )}
                {selectedUser.phone && (
                  <p className="text-sm text-gray-600">
                    Phone: {selectedUser.phone}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Auth: {getAuthProviderLabel(selectedUser)}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Current Role:{" "}
                  <span
                    className={`font-bold capitalize ${
                      selectedUser.role === "spa_owner"
                        ? "text-emerald-600"
                        : "text-blue-600"
                    }`}
                  >
                    {selectedUser.role === "spa_owner"
                      ? "Spa Owner"
                      : selectedUser.role}
                  </span>
                </p>
                <p className="text-sm text-gray-600 mb-4">Change role to:</p>

                <div className="space-y-2">
                  <Button
                    onClick={() => handleUpdateRole("customer")}
                    variant={
                      selectedUser.role === "customer" ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    disabled={selectedUser.role === "customer"}
                  >
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Customer
                  </Button>

                  <Button
                    onClick={() => handleUpdateRole("spa_owner")}
                    variant={
                      selectedUser.role === "spa_owner" ? "default" : "outline"
                    }
                    className={`w-full justify-start ${
                      selectedUser.role !== "spa_owner"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : ""
                    }`}
                    disabled={selectedUser.role === "spa_owner"}
                  >
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Spa Owner
                  </Button>

                  {/* <Button
                    onClick={() => handleUpdateRole("admin")}
                    variant={
                      selectedUser.role === "admin" ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    disabled={selectedUser.role === "admin"}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button> */}
                </div>
              </div>

              {/* Show Spas Owned by this User */}
              {selectedUser.role === "spa_owner" && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Spas Owned ({userSpas.length})
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowEditModal(false);
                        router.push("/dashboard/admin/spas");
                      }}
                      className="text-xs"
                    >
                      Manage Spas
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                  {loadingSpas ? (
                    <div className="text-sm text-gray-500">Loading spas...</div>
                  ) : userSpas.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        <strong>No spas assigned yet.</strong> Go to Spas page
                        to assign spas to this owner.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userSpas.map((spa) => (
                        <div
                          key={spa._id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {spa.title}
                              </p>
                              {spa.location?.region && (
                                <p className="text-xs text-gray-600 mt-1">
                                  <Building2 className="w-3 h-3 inline mr-1" />
                                  {spa.location.region}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowEditModal(false);
                                router.push(`/spa/${spa._id}`);
                              }}
                              className="text-xs"
                            >
                              View
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> User must logout and login again for
                  role changes to take effect.
                </p>
                {selectedUser.role === "spa_owner" && userSpas.length === 0 && (
                  <p className="text-sm text-blue-800 mt-2">
                    <strong>Tip:</strong> After assigning Spa Owner role, go to
                    Spas page to assign specific spas to this owner.
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
