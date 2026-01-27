import User from "../models/User";
import Property from "../models/Property";

/**
 * Calculate commission for a property based on its price and partner's rate
 * @param {number} price - Property price
 * @param {number} rate - Partner's commission rate (default 0.9)
 * @returns {number} Calculated commission
 */
export const calculateCommission = (price, rate = 0.9) => {
    return price * rate;
};

/**
 * Update partner's total earnings when a commission is paid
 * @param {string} partnerId - ID of the partner
 * @param {number} amount - Commission amount to add
 */
export const updatePartnerEarnings = async (partnerId, amount) => {
    const user = await User.findByIdAndUpdate(
        partnerId,
        { $inc: { totalEarnings: amount } },
        { new: true }
    );
    return user;
};

/**
 * Mark a property commission as paid and update partner's earnings
 * @param {string} propertyId - ID of the property
 * @param {string} transactionId - (Optional) Transaction ID for the payment
 */
export const markCommissionAsPaid = async (propertyId, transactionId) => {
    const property = await Property.findById(propertyId);

    if (!property) throw new Error("Property not found");
    if (property.commissionPaid) throw new Error("Commission already paid");

    const partnerId = property.ownerId;
    const amount = property.partnerCommission;

    // Update property status
    property.commissionPaid = true;
    property.commissionPaidDate = new Date();
    if (transactionId) property.commissionTransactionId = transactionId;
    await property.save();

    // Update partner's earnings
    await updatePartnerEarnings(partnerId, amount);

    return property;
};

/**
 * Get earnings summary for a partner
 * @param {string} partnerId - ID of the partner
 */
export const getPartnerEarningsSummary = async (partnerId) => {
    const user = await User.findById(partnerId);
    if (!user) throw new Error("Partner not found");

    return {
        totalEarnings: user.totalEarnings,
        withdrawnAmount: user.withdrawnAmount,
        pendingWithdrawals: user.pendingWithdrawals,
        availableBalance: user.totalEarnings - user.withdrawnAmount - user.pendingWithdrawals
    };
};
