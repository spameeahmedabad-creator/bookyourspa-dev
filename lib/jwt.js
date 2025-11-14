import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Convert secret string to Uint8Array for jose
function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function signToken(payload) {
  const secretKey = getSecretKey();
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secretKey);
  return jwt;
}

export async function verifyToken(token) {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    return null;
  }
}
