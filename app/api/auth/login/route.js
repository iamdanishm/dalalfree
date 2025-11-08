import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/app/lib/db";
import User from "@/app/lib/models/User";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );

    await connectDB();

    const user = await User.findOne({ email });

    if (!user)
      return NextResponse.json({ error: "User not found." }, { status: 404 });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );

    // Successful login
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      {
        message: "Login successful",
        user: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
