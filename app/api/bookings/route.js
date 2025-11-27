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
import {
  sendBookingConfirmationEmail,
  sendBookingNotificationToOwner,
} from "@/lib/email";
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
    const {
      customerName,
      customerPhone,
      customerEmail,
      spaId,
      service,
      date,
      time,
    } = data;

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

    // Get spa details with owner email
    const spa = await Spa.findById(spaId).populate(
      "ownerId",
      "name phone email"
    );
    if (!spa) {
      return NextResponse.json({ error: "Spa not found" }, { status: 404 });
    }

    // Validate booking time against store hours
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Check if booking is on Sunday and spa is closed on Sunday
    if (dayOfWeek === 0 && spa.storeHours?.sundayClosed) {
      return NextResponse.json(
        { error: "This spa is closed on Sundays. Please select another day." },
        { status: 400 }
      );
    }

    // Validate booking time is within store hours
    if (spa.storeHours?.openingTime && spa.storeHours?.closingTime) {
      const openingTime = spa.storeHours.openingTime; // Format: "HH:MM"
      const closingTime = spa.storeHours.closingTime; // Format: "HH:MM"
      const bookingTime = time; // Format: "HH:MM"

      // Convert times to minutes for comparison
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const openingMinutes = timeToMinutes(openingTime);
      const closingMinutes = timeToMinutes(closingTime);
      const bookingMinutes = timeToMinutes(bookingTime);

      if (bookingMinutes < openingMinutes || bookingMinutes >= closingMinutes) {
        return NextResponse.json(
          {
            error: `Booking time must be between ${openingTime} and ${closingTime}. This spa is open from ${openingTime} to ${closingTime}.`,
          },
          { status: 400 }
        );
      }
    }

    // Check if user is logged in and get user email
    const token = request.cookies.get("token")?.value;
    let userId = null;
    let userEmail = null;
    if (token) {
      const decoded = await verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
        // Get user email if logged in
        const user = await User.findById(userId).select("email");
        if (user && user.email) {
          userEmail = user.email;
        }
      }
    }

    // Use customerEmail from form if provided, otherwise use logged-in user's email
    const emailToSend = customerEmail || userEmail;

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
    const location =
      spa.location?.address || spa.location?.region || "Location not specified";

    // Send WhatsApp confirmation to customer
    await sendWhatsAppBookingConfirmation(
      customerPhone,
      customerName,
      spa.title,
      service,
      location,
      formattedDateTime
    );

    // Send email confirmation to customer (if email is available)
    // Use email from form (for unregistered users) or logged-in user's email
    if (emailToSend) {
      try {
        await sendBookingConfirmationEmail(
          emailToSend,
          customerName,
          spa.title,
          service,
          location,
          formattedDateTime
        );
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
        // Don't fail the booking if email fails
      }
    }

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

    // Send email notification to spa owner (if email is available)
    if (spa.ownerId?.email) {
      try {
        await sendBookingNotificationToOwner(
          spa.ownerId.email,
          spa.ownerId.name,
          spa.title,
          customerName,
          customerPhone,
          service,
          formattedDateTime
        );
      } catch (emailError) {
        console.error(
          "Failed to send booking notification email to owner:",
          emailError
        );
        // Don't fail the booking if email fails
      }
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
