import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Spa from "@/models/Spa";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";
import {
  sendWhatsAppBookingConfirmation,
  sendWhatsAppSpaOwnerNotification,
} from "@/lib/fast2sms";
import { format } from "date-fns";

// GET bookings (role-based)
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    // Allow without auth for testing
    if (!token) {
      await dbConnect();
      const bookings = await Booking.find()
        .populate("spaId", "title location")
        .populate("userId", "name phone")
        .sort({ createdAt: -1 });
      return NextResponse.json({ bookings });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    let bookings;

    if (decoded.role === "admin") {
      // Admin sees all bookings
      bookings = await Booking.find()
        .populate("spaId", "title location")
        .populate("userId", "name phone")
        .sort({ createdAt: -1 });
    } else if (decoded.role === "spa_owner") {
      // Spa owner sees only their spa's bookings
      const ownedSpas = await Spa.find({ ownerId: decoded.userId }).select(
        "_id"
      );
      const spaIds = ownedSpas.map((spa) => spa._id);
      bookings = await Booking.find({ spaId: { $in: spaIds } })
        .populate("spaId", "title location")
        .populate("userId", "name phone")
        .sort({ createdAt: -1 });
    } else {
      // Customer sees only their bookings
      bookings = await Booking.find({ userId: decoded.userId })
        .populate("spaId", "title location")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST create booking (with or without login)
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { customerName, customerPhone, spaId, service, date, time } = data;

    if (
      !customerName ||
      !customerPhone ||
      !spaId ||
      !service ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get spa details
    const spa = await Spa.findById(spaId).populate("ownerId", "name phone");
    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    // Check if user is logged in
    const token = request.cookies.get("token")?.value;
    let userId = null;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      spaId,
      customerName,
      customerPhone,
      service,
      date: new Date(date),
      time,
      status: "confirmed",
    });

    // Format date and time for messages
    const formattedDateTime = `${format(
      new Date(date),
      "MMMM dd, yyyy"
    )} at ${time}`;

    // Send WhatsApp confirmation to customer
    await sendWhatsAppBookingConfirmation(
      customerPhone,
      customerName,
      spa.title,
      service,
      spa.location?.address || spa.location?.region || "Location not specified",
      formattedDateTime
    );

    // Send WhatsApp notification to spa owner
    if (spa.ownerId?.phone) {
      await sendWhatsAppSpaOwnerNotification(
        spa.ownerId.phone,
        spa.ownerId.name,
        spa.title,
        customerName,
        customerPhone,
        service,
        formattedDateTime
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking confirmed successfully",
        booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
