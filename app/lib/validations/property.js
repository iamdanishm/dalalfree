import { z } from "zod";

export const propertyBasicSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  propertyType: z.enum(["sell", "rent"]),
  category: z.enum(["Residential", "Commercial", "Land"]),
  price: z.coerce.number().positive("Price must be a positive number"),
  location: z.string().min(1, "Location is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  // Add more fields as needed based on the full property model
});

export const propertySearchSchema = z.object({
  tab: z.enum(["buy", "rent", "commercial"]).optional().default("buy"),
  city: z.string().optional(),
  locality: z.string().optional(),
  propertyType: z.string().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  sort: z.enum(["relevance", "price-low", "price-high", "verified-first", "newest", "oldest"]).optional().default("relevance"),
  verifiedOnly: z.coerce.boolean().optional().default(true),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});
