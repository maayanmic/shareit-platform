import { pgTable, text, serial, integer, boolean, timestamp, json, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: text("role").default("user"),
  coins: integer("coins").default(0),
  referrals: integer("referrals").default(0),
  savedOffers: integer("saved_offers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Businesses table
export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  category: text("category"),
  discount: text("discount"),
  rating: integer("rating").default(4),
  location: text("location"),
  validUntil: text("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recommendations table
export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessId: uuid("business_id").notNull().references(() => businesses.id),
  businessName: text("business_name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  discount: text("discount"),
  socialNetwork: text("social_network"),
  validUntil: text("valid_until"),
  savedCount: integer("saved_count").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved Offers table
export const savedOffers = pgTable("saved_offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull().references(() => users.id),
  recommendationId: uuid("recommendation_id").notNull().references(() => recommendations.id),
  saved: boolean("saved").default(true),
  claimed: boolean("claimed").default(false),
  savedAt: timestamp("saved_at").defaultNow(),
  claimedAt: timestamp("claimed_at"),
});

// Wallet table
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  coins: integer("coins").default(0),
  transactions: json("transactions").$type<{ amount: number, description: string, timestamp: string }[]>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  photoURL: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).pick({
  name: true,
  description: true,
  image: true,
  category: true,
  discount: true,
  rating: true,
  location: true,
  validUntil: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  userId: true,
  businessId: true,
  businessName: true,
  description: true,
  imageUrl: true,
  discount: true,
  socialNetwork: true,
  validUntil: true,
});

export const insertSavedOfferSchema = createInsertSchema(savedOffers).pick({
  userId: true,
  recommendationId: true,
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  coins: true,
  transactions: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type InsertSavedOffer = z.infer<typeof insertSavedOfferSchema>;
export type SavedOffer = typeof savedOffers.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
