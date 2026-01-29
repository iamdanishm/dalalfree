import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("User not found");
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Invalid password");
        return {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role || "user",
          partnerRequestStatus: user.partnerRequestStatus || "none",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      await connectDB();
      if (account.provider === "google") {
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            role: "user", // new users from Google signup
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // Fetch latest role and status from DB if it's a new session or a forced update
      if (user) {
        token.id = user.id || user._id;
        token.role = user.role || "user";
        token.phone = user.phone;
        token.partnerRequestStatus = user.partnerRequestStatus || "none";
      }

      // Handle session update trigger
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.phone) token.phone = session.phone;
        if (session.role) token.role = session.role;
        if (session.partnerRequestStatus) token.partnerRequestStatus = session.partnerRequestStatus;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.phone = token.phone;
      session.user.partnerRequestStatus = token.partnerRequestStatus;
      return session;
    },
  },

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
