import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Spa from "@/models/Spa";

// POST - Update user role (Admin only)
export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { userId, newRole } = await request.json();

    // Validation
    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "User ID and new role are required" },
        { status: 400 }
      );
    }

    if (!["customer", "spa_owner", "admin"].includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    // Handle Spa ownership based on role change
    if (oldRole === "customer" && newRole === "spa_owner") {
      // When customer becomes spa_owner: Find Spas matching user's phone number
      // Normalize phone numbers for comparison (remove spaces, dashes, parentheses, plus signs)
      const normalizePhone = (phone) => {
        if (!phone) return "";
        // Remove spaces, dashes, parentheses, plus signs for comparison
        return phone.replace(/[\s\-\(\)\+]/g, "");
      };

      const userPhoneNormalized = normalizePhone(user.phone);

      // Find Spas where contact.phone matches user's phone
      const matchingSpas = await Spa.find({
        "contact.phone": { $exists: true, $ne: null },
      });

      const spasToAssign = matchingSpas.filter(
        (spa) => normalizePhone(spa.contact?.phone) === userPhoneNormalized
      );

      if (spasToAssign.length > 0) {
        const spaIds = spasToAssign.map((spa) => spa._id);
        const updateResult = await Spa.updateMany(
          { _id: { $in: spaIds } },
          { $set: { ownerId: user._id } }
        );
        console.log(
          `Assigned ${updateResult.modifiedCount} Spa(s) to new spa_owner ${user._id} (phone: ${user.phone})`
        );
      } else {
        console.log(
          `No Spas found matching phone number ${user.phone} for user ${user._id}`
        );
      }
    } else if (oldRole === "spa_owner" && newRole === "customer") {
      // When spa_owner becomes customer: Remove ownership from all Spas owned by this user
      // Transfer ownership to admin user
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        // Transfer ownership to admin
        const updateResult = await Spa.updateMany(
          { ownerId: user._id },
          { $set: { ownerId: adminUser._id } }
        );
        console.log(
          `Transferred ${updateResult.modifiedCount} Spas from user ${user._id} to admin ${adminUser._id}`
        );
      } else {
        // If no admin exists, we need to handle this case
        // Since ownerId is required, we'll keep the ownership but log a warning
        console.warn(
          `No admin user found to transfer Spas from user ${user._id}. Ownership retained.`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `User role updated from ${oldRole} to ${newRole}`,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
