import User from "../models/User";
import bcrypt from "bcrypt";
import { AppError } from "../utils/errors";
import { connectDB } from "../db";

export class UserService {
  /**
   * Register a new user
   */
  static async register(userData) {
    await connectDB();
    const { name, email, password, phone } = userData;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError("Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role: "user",
      accountStatus: "active",
    });

    return newUser;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (updateData.name) user.name = updateData.name.trim();
    if (updateData.phone) user.phone = updateData.phone.trim();

    await user.save();
    return user;
  }

  /**
   * Submit a partner request
   */
  static async submitPartnerRequest(userId) {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.role === "partner") {
      throw new AppError("You are already a partner", 400);
    }

    if (user.partnerRequestStatus === "pending") {
      throw new AppError("You already have a pending request", 400);
    }

    user.partnerRequestStatus = "pending";
    user.partnerRequestDate = new Date();

    await user.save();
    return user;
  }

  /**
   * Get user by ID with sensitive fields optionally included
   */
  static async getUserById(userId, includePassword = false) {
    await connectDB();
    const query = User.findById(userId);
    if (includePassword) query.select("+password");
    
    const user = await query;
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }
}
