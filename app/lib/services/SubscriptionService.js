import User from "../models/User";
import { AppError } from "../utils/errors";
import { connectDB } from "../db";

export class SubscriptionService {
  /**
   * Check if user can reveal a contact
   */
  static async canRevealContact(userId) {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.role !== "user") return true; // Admins/Partners have unlimited access (or different rules)

    const sub = user.subscription || {};
    
    // 1. Check active subscription
    if (sub.status === "active" && sub.endDate > new Date()) {
      return true;
    }

    // 2. Check free trial
    if (sub.status === "free_trial" && sub.freeTrialEndDate > new Date()) {
      return true;
    }

    // 3. Check credits
    if (sub.adUnlockCredits > 0) {
      return true;
    }

    return false;
  }

  /**
   * Deduct credit for revealing contact
   */
  static async deductCredit(userId) {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.role !== "user") return; // No deduction for non-users

    const sub = user.subscription || {};

    // If active subscription or free trial, no credit deduction
    if ((sub.status === "active" && sub.endDate > new Date()) || 
        (sub.status === "free_trial" && sub.freeTrialEndDate > new Date())) {
      return;
    }

    if (sub.adUnlockCredits <= 0) {
      throw new AppError("No credits available. Please upgrade your plan.", 403);
    }

    user.subscription.adUnlockCredits -= 1;
    await user.save();
  }

  /**
   * Start free trial for a user
   */
  static async startFreeTrial(userId) {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.subscription?.freeTrialUsed) {
      throw new AppError("Free trial already used", 400);
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    user.subscription = {
      ...user.subscription,
      status: "free_trial",
      freeTrialUsed: true,
      freeTrialStartDate: now,
      freeTrialEndDate: expiry,
      startDate: now,
      endDate: expiry,
    };

    await user.save();
    return user.subscription;
  }

  /**
   * Add credits to user
   */
  static async addCredits(userId, amount) {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (!user.subscription) {
        user.subscription = { status: "none", freeTrialUsed: false, adUnlockCredits: 0 };
    }

    user.subscription.adUnlockCredits += amount;
    await user.save();
    return user.subscription;
  }
}
