// Extracts {lat, lng} from a full Google Maps URL. Returns null if not found.
// Handles /place/ URLs (!3d!4d), /dir/ URLs (!2m2!1d!2d), and /@lat,lng fallback.
export function extractCoordsFromGoogleMapsUrl(url) {
  if (!url) return null;
  // Place URLs: !3d<lat>!4d<lng>
  let m = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  // Direction URLs: !2m2!1d<lng>!2d<lat>
  m = url.match(/!2m2!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/);
  if (m) return { lat: parseFloat(m[2]), lng: parseFloat(m[1]) };
  // Fallback: /@lat,lng,zoom
  m = url.match(new RegExp("/@(-?\\d+\\.?\\d*),(-?\\d+\\.?\\d*),\\d+z"));
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  return null;
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km) {
  return km < 1
    ? `${Math.round(km * 1000)} m away`
    : `${km.toFixed(1)} km away`;
}
