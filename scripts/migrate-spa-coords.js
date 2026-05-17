/**
 * One-time migration: extract lat/lng from googleMapsLink for all spas
 * that don't yet have coordinates stored.
 *
 * Run: node scripts/migrate-spa-coords.js
 */

require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

function extractCoordsFromGoogleMapsUrl(url) {
  if (!url) return null;
  // Place URLs: !3d<lat>!4d<lng>
  let m = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (m)
    return {
      lat: parseFloat(m[1]),
      lng: parseFloat(m[2]),
      method: "place !3d!4d",
    };
  // Direction URLs: !2m2!1d<lng>!2d<lat>
  m = url.match(/!2m2!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/);
  if (m)
    return {
      lat: parseFloat(m[2]),
      lng: parseFloat(m[1]),
      method: "dir !1d!2d",
    };
  // Fallback: /@lat,lng,zoom
  m = url.match(new RegExp("/@(-?\\d+\\.?\\d*),(-?\\d+\\.?\\d*),\\d+z"));
  if (m)
    return {
      lat: parseFloat(m[1]),
      lng: parseFloat(m[2]),
      method: "/@lat,lng",
    };
  return null;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const spas = await db
    .collection("spas")
    .find({}, { projection: { title: 1, location: 1 } })
    .toArray();

  console.log(`Found ${spas.length} spas total\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const spa of spas) {
    const loc = spa.location || {};

    // Skip if already has coordinates
    if (loc.latitude != null && loc.longitude != null) {
      console.log(
        `⏭  ${spa.title} — already has coords (${loc.latitude}, ${loc.longitude})`,
      );
      skipped++;
      continue;
    }

    const coords = extractCoordsFromGoogleMapsUrl(loc.googleMapsLink);
    if (coords) {
      await db
        .collection("spas")
        .updateOne(
          { _id: spa._id },
          {
            $set: {
              "location.latitude": coords.lat,
              "location.longitude": coords.lng,
            },
          },
        );
      console.log(`✅ ${spa.title}`);
      console.log(
        `   lat: ${coords.lat}, lng: ${coords.lng} (${coords.method})`,
      );
      updated++;
    } else {
      console.log(`❌ ${spa.title} — cannot extract coords from URL`);
      console.log(`   URL: ${loc.googleMapsLink || "NONE"}`);
      failed++;
    }
  }

  console.log(`\n--- Done ---`);
  console.log(
    `Updated: ${updated}  |  Already had coords: ${skipped}  |  Could not extract: ${failed}`,
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
