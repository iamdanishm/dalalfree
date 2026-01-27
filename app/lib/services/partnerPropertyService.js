import Property from "../models/Property";
import { calculateCommission } from "./commissionService";

/**
 * Get properties for a specific partner with optional filters
 */
export const getPartnerProperties = async (partnerId, filters = {}) => {
    const query = { ownerId: partnerId, ...filters };
    return await Property.find(query).sort({ createdAt: -1 }).lean();
};

/**
 * Update property commission details if price changes
 */
export const updatePropertyCommissionDetails = async (propertyId, newPrice, commissionRate) => {
    const partnerCommission = calculateCommission(newPrice, commissionRate);
    return await Property.findByIdAndUpdate(
        propertyId,
        { partnerCommission },
        { new: true }
    );
};

/**
 * Archive a partner's property
 */
export const archivePartnerProperty = async (propertyId, reason) => {
    return await Property.findByIdAndUpdate(
        propertyId,
        {
            isArchived: true,
            archivedReason: reason,
            archivedAt: new Date()
        },
        { new: true }
    );
};
