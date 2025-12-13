import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Coupon from "@/models/Coupon";

// GET - Fetch active promotional banners
export async function GET() {
  try {
    await connectDB();

    const now = new Date();

    // Find active coupons with banner enabled
    const promotions = await Coupon.find({
      isActive: true,
      showBanner: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    })
      .select("code type value bannerText bannerColor bannerPosition scope spaId endDate")
      .populate("spaId", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Format promotions for display
    const formattedPromotions = promotions.map((promo) => {
      let displayText = promo.bannerText;
      
      // If no custom banner text, generate one
      if (!displayText) {
        if (promo.type === "percent") {
          displayText = `🎉 ${promo.value}% OFF! Use code: ${promo.code}`;
        } else {
          displayText = `🎉 ₹${promo.value} OFF! Use code: ${promo.code}`;
        }
        
        if (promo.scope === "spa" && promo.spaId?.name) {
          displayText += ` at ${promo.spaId.name}`;
        }
      }

      return {
        id: promo._id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        text: displayText,
        color: promo.bannerColor || "emerald",
        position: promo.bannerPosition || "top",
        scope: promo.scope,
        spaName: promo.spaId?.name || null,
        expiresAt: promo.endDate,
      };
    });

    return NextResponse.json({
      success: true,
      promotions: formattedPromotions,
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

