import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import { NextRequest } from "next/server";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          const email = user.email?.toLowerCase();
          if (!email) {
            return false;
          }

          // Check if user exists by email or googleId
          let existingUser = await User.findOne({
            $or: [{ email }, { googleId: account.providerAccountId }],
          });

          if (existingUser) {
            // Update googleId if not set
            if (!existingUser.googleId) {
              existingUser.googleId = account.providerAccountId;
              existingUser.emailVerified = true; // Google emails are verified
              await existingUser.save();
            }
          } else {
            // Create new user
            existingUser = await User.create({
              name: user.name || profile?.name || "User",
              email,
              googleId: account.providerAccountId,
              emailVerified: true, // Google emails are verified
              role: "customer",
            });
          }

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({
            $or: [
              { email: user.email.toLowerCase() },
              { googleId: account.providerAccountId },
            ],
          });

          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.role = dbUser.role;
            token.phone = dbUser.phone;
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export async function GET(request, context) {
  return handler(request, context);
}

export async function POST(request, context) {
  return handler(request, context);
}
