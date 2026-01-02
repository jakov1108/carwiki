import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth schema types
export { user, session, account, verification, type SafeUser } from "./auth-schema";

// ========== CAR MODELS (Brand + Model Name) ==========
// npr. VW Golf, BMW 3 Series, Audi A4
export const carModels = pgTable("car_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brand: text("brand").notNull(),
  brandSlug: text("brand_slug").notNull().default(""), // url-friendly: volkswagen, bmw
  model: text("model").notNull(),
  modelSlug: text("model_slug").notNull().default(""), // url-friendly: golf, 3-series
  category: text("category").notNull(), // Compact, Sedan, SUV, Sports, Electric
  image: text("image").notNull(), // Glavna slika modela
  description: text("description").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCarModelSchema = createInsertSchema(carModels).omit({
  id: true,
  createdAt: true,
});

export type InsertCarModel = z.infer<typeof insertCarModelSchema>;
export type CarModel = typeof carModels.$inferSelect;

// ========== CAR GENERATIONS ==========
// npr. Golf MK7, Golf MK8, BMW E90, BMW F30
export const carGenerations = pgTable("car_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  modelId: varchar("model_id").notNull().references(() => carModels.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // npr. "MK7", "E90", "B8"
  slug: text("slug").notNull().default(""), // url-friendly: mk7, e90, b8
  yearStart: integer("year_start").notNull(),
  yearEnd: integer("year_end"), // null ako se još proizvodi
  image: text("image").notNull(),
  description: text("description").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCarGenerationSchema = createInsertSchema(carGenerations).omit({
  id: true,
  createdAt: true,
});

export type InsertCarGeneration = z.infer<typeof insertCarGenerationSchema>;
export type CarGeneration = typeof carGenerations.$inferSelect;

// ========== CAR VARIANTS (Engine configurations) ==========
// npr. Golf MK7 2.0 TDI 150 KS, Golf MK7 1.4 TSI 125 KS
export const carVariants = pgTable("car_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  generationId: varchar("generation_id").notNull().references(() => carGenerations.id, { onDelete: "cascade" }),
  engineName: text("engine_name").notNull(), // npr. "2.0 TDI", "1.4 TSI"
  slug: text("slug").notNull().default(""), // url-friendly: 20tdi, 14tsi
  engineCode: text("engine_code"), // npr. "CRLB", "CZEA"
  displacement: text("displacement"), // npr. "1968 ccm"
  fuelType: text("fuel_type").notNull(), // Benzin, Dizel, Hibrid, Električni
  power: text("power").notNull(), // npr. "150 KS"
  torque: text("torque"), // npr. "340 Nm"
  acceleration: text("acceleration").notNull(), // npr. "8.6s"
  topSpeed: text("top_speed"), // npr. "216 km/h"
  consumption: text("consumption").notNull(), // npr. "4.5L/100km"
  transmission: text("transmission").notNull(), // npr. "6-brzinski ručni", "7-DSG"
  driveType: text("drive_type").notNull(), // FWD, RWD, AWD
  videoUrl: text("video_url"),
  reliability: integer("reliability").notNull().default(3),
  status: text("status").notNull().default("approved"), // pending, approved, rejected
  submittedBy: text("submitted_by"),
  submittedByName: text("submitted_by_name"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCarVariantSchema = createInsertSchema(carVariants).omit({
  id: true,
  createdAt: true,
});

export type InsertCarVariant = z.infer<typeof insertCarVariantSchema>;
export type CarVariant = typeof carVariants.$inferSelect;

// ========== LEGACY: Keep old cars table for migration compatibility ==========
export const cars = pgTable("cars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  engine: text("engine").notNull(),
  power: text("power").notNull(),
  acceleration: text("acceleration").notNull(),
  consumption: text("consumption").notNull(),
  driveType: text("drive_type").notNull(),
  category: text("category").notNull(),
  videoUrl: text("video_url"),
  reliability: integer("reliability").notNull().default(3),
  status: text("status").notNull().default("approved"),
  submittedBy: text("submitted_by"),
  submittedByName: text("submitted_by_name"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  createdAt: true,
});

export type InsertCar = z.infer<typeof insertCarSchema>;
export type Car = typeof cars.$inferSelect;

// ========== Extended types for frontend with joined data ==========
export type CarGenerationWithModel = CarGeneration & {
  model: CarModel;
};

export type CarVariantWithDetails = CarVariant & {
  generation: CarGeneration;
  model: CarModel;
};

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().default(""),
  content: text("content").notNull(),
  author: text("author").notNull(),
  date: text("date").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  excerpt: text("excerpt").notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  date: text("date").notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  date: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// ========== IMAGES (Multiple images for any entity) ==========
export const images = pgTable("images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  entityType: text("entity_type").notNull(), // 'model', 'generation', 'variant', 'blog'
  entityId: varchar("entity_id").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
});

export type InsertImage = z.infer<typeof insertImageSchema>;
export type Image = typeof images.$inferSelect;
