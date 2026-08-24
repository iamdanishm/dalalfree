import mongoose from "mongoose";
import User from "../models/User";
import UserContactHistory from "../models/UserContactHistory";
import Property from "../models/Property";
import { AppError } from "../utils/errors";

export class ContactService {
  /**
   * Reveals property owner contact details and deducts credits.
   * Uses a transaction to ensure atomic update of credits and history.
   */
  static async revealContact(userId, propertyId, contactType = "phone") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get Property and Owner
      const property = await Property.findById(propertyId).populate("ownerId").session(session);
      if (!property) throw new AppError("Property not found", 404);

      const owner = property.ownerId;
      if (!owner) throw new AppError("Property owner not found", 404);

      // 2. Check if already revealed
      const existingHistory = await UserContactHistory.findOne({
        userId,
        propertyId
      }).session(session);

      if (existingHistory) {
        await session.commitTransaction();
        session.endSession();
        return {
          owner,
          alreadyRevealed: true
        };
      }

      // 3. Deduct Credits from User
      const user = await User.findById(userId).session(session);
      if (!user) throw new AppError("User not found", 404);

      // Credit logic: Check if user has sufficient credits
      const cost = 1;
      
      // Handle nested subscription credits
      const currentCredits = user.subscription?.adUnlockCredits || 0;
      
      if (currentCredits < cost) {
        throw new AppError("Insufficient credits. Please upgrade your plan.", 402);
      }

      // Update credits
      await User.findByIdAndUpdate(
        userId,
        { $inc: { "subscription.adUnlockCredits": -cost } },
        { session, new: true }
      );

      // 4. Log to History
      const contactValue = contactType === 'email' ? owner.email : (owner.phone || owner.contact);

      await UserContactHistory.create([{
        userId,
        propertyId,
        contactType,
        contactValue,
        creditsUsed: cost
      }], { session });

      await session.commitTransaction();
      session.endSession();
      
      return {
        owner,
        alreadyRevealed: false
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
