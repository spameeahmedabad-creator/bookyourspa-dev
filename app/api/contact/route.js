import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { sendContactFormNotificationToAdmin } from "@/lib/email";
import { validateEmail } from "@/lib/form-validation";

export async function POST(request) {
  try {
    await dbConnect();

    const data = await request.json();
    const { name, email, phone, subject, message } = data;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Create contact submission
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
    });

    // Send email notification to admin
    try {
      await sendContactFormNotificationToAdmin(
        contact.name,
        contact.email,
        contact.phone,
        contact.subject,
        contact.message
      );
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error(
        "[Contact API] Failed to send admin notification email:",
        emailError
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! We'll get back to you soon.",
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Contact API] Error:", error);

    // Handle duplicate email error (if email is unique in schema)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A submission with this email already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit contact form. Please try again." },
      { status: 500 }
    );
  }
}
