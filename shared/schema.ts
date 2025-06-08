// Firebase TypeScript interfaces and schemas
import { z } from "zod";

// User interface for Firebase
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  coins?: number;
  referrals?: number;
  savedOffers?: number;
  connections?: string[];
  createdAt?: any; // Firebase Timestamp
}

// Business interface for Firebase
export interface Business {
  id: string;
  name: string;
  description: string;
  image?: string;
  logoUrl?: string;
  category: string;
  address?: string;
  phone?: string;
  website?: string;
  hours?: string;
  rating?: number;
  createdAt?: any; // Firebase Timestamp
}

// Recommendation interface for Firebase
export interface Recommendation {
  id: string;
  userId: string;
  businessId: string;
  businessName: string;
  text?: string;
  description?: string;
  imageUrl?: string;
  discount?: string;
  rating?: number;
  validUntil?: string;
  savedCount?: number;
  viewCount?: number;
  createdAt?: any; // Firebase Timestamp
}

// Saved Offer interface for Firebase
export interface SavedOffer {
  id: string;
  userId: string;
  recommendationId: string;
  saved?: boolean;
  claimed?: boolean;
  savedAt?: any; // Firebase Timestamp
  claimedAt?: any; // Firebase Timestamp
}

// Connection interface for Firebase
export interface Connection {
  id: string;
  userId: string;
  targetUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt?: any; // Firebase Timestamp
}

// Zod validation schemas
export const userSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  role: z.string().optional(),
  coins: z.number().optional(),
  referrals: z.number().optional(),
  savedOffers: z.number().optional(),
  connections: z.array(z.string()).optional(),
});

export const businessSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  category: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  hours: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const recommendationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  businessId: z.string(),
  businessName: z.string().min(1),
  text: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  discount: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  validUntil: z.string().optional(),
  savedCount: z.number().optional(),
  viewCount: z.number().optional(),
});

export const savedOfferSchema = z.object({
  id: z.string(),
  userId: z.string(),
  recommendationId: z.string(),
  saved: z.boolean().optional(),
  claimed: z.boolean().optional(),
});

export const connectionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  targetUserId: z.string(),
  status: z.enum(['pending', 'accepted', 'declined']),
});

// Insert schemas (for creating new documents)
export const insertUserSchema = userSchema.omit({ uid: true });
export const insertBusinessSchema = businessSchema.omit({ id: true });
export const insertRecommendationSchema = recommendationSchema.omit({ id: true });
export const insertSavedOfferSchema = savedOfferSchema.omit({ id: true });
export const insertConnectionSchema = connectionSchema.omit({ id: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type InsertSavedOffer = z.infer<typeof insertSavedOfferSchema>;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;