import { db } from "./db";
import {
  cars,
  carModels,
  carGenerations,
  carVariants,
  blogPosts,
  contactMessages,
  type InsertCar,
  type InsertCarModel,
  type InsertCarGeneration,
  type InsertCarVariant,
  type InsertBlogPost,
  type InsertContactMessage,
  type CarVariantWithDetails,
  type CarGenerationWithModel,
} from "../shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Helper function to generate URL-friendly slugs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[đ]/g, 'd')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

export const storage = {
  // ========== CAR MODELS ==========
  async getCarModels() {
    return await db.select().from(carModels).orderBy(carModels.brand, carModels.model);
  },

  async getBrands() {
    const models = await db.select().from(carModels).orderBy(carModels.brand);
    const brandsMap = new Map<string, { brand: string; brandSlug: string }>();
    models.forEach(m => {
      if (!brandsMap.has(m.brandSlug)) {
        brandsMap.set(m.brandSlug, { brand: m.brand, brandSlug: m.brandSlug });
      }
    });
    return Array.from(brandsMap.values());
  },

  async getModelsByBrand(brandSlug: string) {
    const allModels = await db.select().from(carModels).orderBy(carModels.model);
    return allModels.filter(m => m.brandSlug === brandSlug);
  },

  async getCarModelById(id: string) {
    const [model] = await db.select().from(carModels).where(eq(carModels.id, id)).limit(1);
    return model;
  },

  async getCarModelBySlug(brandSlug: string, modelSlug: string) {
    const allModels = await db.select().from(carModels);
    return allModels.find(m => m.brandSlug === brandSlug && m.modelSlug === modelSlug) || null;
  },

  async createCarModel(data: InsertCarModel) {
    const [model] = await db.insert(carModels).values(data).returning();
    return model;
  },

  async updateCarModel(id: string, data: Partial<InsertCarModel>) {
    const [model] = await db.update(carModels).set(data).where(eq(carModels.id, id)).returning();
    return model;
  },

  async deleteCarModel(id: string) {
    await db.delete(carModels).where(eq(carModels.id, id));
  },

  // ========== CAR GENERATIONS ==========
  async getCarGenerations() {
    const generations = await db.select().from(carGenerations).orderBy(desc(carGenerations.yearStart));
    const models = await db.select().from(carModels);
    
    return generations.map(gen => ({
      ...gen,
      model: models.find(m => m.id === gen.modelId)!
    })) as CarGenerationWithModel[];
  },

  async getCarGenerationsByModelId(modelId: string) {
    const generations = await db.select().from(carGenerations)
      .where(eq(carGenerations.modelId, modelId))
      .orderBy(desc(carGenerations.yearStart));
    
    const [model] = await db.select().from(carModels).where(eq(carModels.id, modelId)).limit(1);
    
    return generations.map(gen => ({
      ...gen,
      model
    })) as CarGenerationWithModel[];
  },

  async getCarGenerationById(id: string) {
    const [generation] = await db.select().from(carGenerations).where(eq(carGenerations.id, id)).limit(1);
    if (!generation) return null;
    
    const [model] = await db.select().from(carModels).where(eq(carModels.id, generation.modelId)).limit(1);
    return { ...generation, model } as CarGenerationWithModel;
  },

  async getCarGenerationBySlug(modelId: string, generationSlug: string) {
    const generations = await db.select().from(carGenerations).where(eq(carGenerations.modelId, modelId));
    const generation = generations.find(g => g.slug === generationSlug);
    if (!generation) return null;
    
    const [model] = await db.select().from(carModels).where(eq(carModels.id, generation.modelId)).limit(1);
    return { ...generation, model } as CarGenerationWithModel;
  },

  async createCarGeneration(data: InsertCarGeneration) {
    const [generation] = await db.insert(carGenerations).values(data).returning();
    return generation;
  },

  async updateCarGeneration(id: string, data: Partial<InsertCarGeneration>) {
    const [generation] = await db.update(carGenerations).set(data).where(eq(carGenerations.id, id)).returning();
    return generation;
  },

  async deleteCarGeneration(id: string) {
    await db.delete(carGenerations).where(eq(carGenerations.id, id));
  },

  // ========== CAR VARIANTS ==========
  async getCarVariants() {
    const variants = await db.select().from(carVariants)
      .where(eq(carVariants.status, "approved"))
      .orderBy(desc(carVariants.createdAt));
    
    return await this.enrichVariants(variants);
  },

  async getAllCarVariants() {
    const variants = await db.select().from(carVariants).orderBy(desc(carVariants.createdAt));
    return await this.enrichVariants(variants);
  },

  async getPendingCarVariants() {
    const variants = await db.select().from(carVariants)
      .where(eq(carVariants.status, "pending"))
      .orderBy(desc(carVariants.createdAt));
    
    return await this.enrichVariants(variants);
  },

  async getCarVariantsByGenerationId(generationId: string) {
    const variants = await db.select().from(carVariants)
      .where(and(
        eq(carVariants.generationId, generationId),
        eq(carVariants.status, "approved")
      ))
      .orderBy(carVariants.engineName);
    
    return await this.enrichVariants(variants);
  },

  async getCarVariantById(id: string) {
    const [variant] = await db.select().from(carVariants).where(eq(carVariants.id, id)).limit(1);
    if (!variant) return null;
    
    const [generation] = await db.select().from(carGenerations).where(eq(carGenerations.id, variant.generationId)).limit(1);
    const [model] = await db.select().from(carModels).where(eq(carModels.id, generation?.modelId || '')).limit(1);
    
    return { ...variant, generation, model } as CarVariantWithDetails;
  },

  async getCarVariantBySlug(generationId: string, variantSlug: string) {
    const variants = await db.select().from(carVariants)
      .where(and(eq(carVariants.generationId, generationId), eq(carVariants.status, "approved")));
    const variant = variants.find(v => v.slug === variantSlug);
    if (!variant) return null;
    
    const [generation] = await db.select().from(carGenerations).where(eq(carGenerations.id, variant.generationId)).limit(1);
    const [model] = await db.select().from(carModels).where(eq(carModels.id, generation?.modelId || '')).limit(1);
    
    return { ...variant, generation, model } as CarVariantWithDetails;
  },

  async createCarVariant(data: InsertCarVariant) {
    const [variant] = await db.insert(carVariants).values(data).returning();
    return variant;
  },

  async updateCarVariant(id: string, data: Partial<InsertCarVariant>) {
    const [variant] = await db.update(carVariants).set(data).where(eq(carVariants.id, id)).returning();
    return variant;
  },

  async updateCarVariantStatus(id: string, status: "approved" | "rejected") {
    const [variant] = await db.update(carVariants).set({ status }).where(eq(carVariants.id, id)).returning();
    return variant;
  },

  async deleteCarVariant(id: string) {
    await db.delete(carVariants).where(eq(carVariants.id, id));
  },

  // Helper to enrich variants with generation and model data
  async enrichVariants(variants: typeof carVariants.$inferSelect[]): Promise<CarVariantWithDetails[]> {
    const generations = await db.select().from(carGenerations);
    const models = await db.select().from(carModels);
    
    return variants.map(variant => {
      const generation = generations.find(g => g.id === variant.generationId)!;
      const model = models.find(m => m.id === generation?.modelId)!;
      return { ...variant, generation, model };
    });
  },

  // ========== LEGACY CAR FUNCTIONS (for backward compatibility) ==========
  async getCars() {
    return await db.select().from(cars).where(eq(cars.status, "approved")).orderBy(desc(cars.createdAt));
  },

  async getAllCars() {
    return await db.select().from(cars).orderBy(desc(cars.createdAt));
  },

  async getPendingCars() {
    return await db.select().from(cars).where(eq(cars.status, "pending")).orderBy(desc(cars.createdAt));
  },

  async getCarById(id: string) {
    const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
    return car;
  },

  async createCar(data: InsertCar) {
    const [car] = await db.insert(cars).values(data).returning();
    return car;
  },

  async updateCar(id: string, data: Partial<InsertCar>) {
    const [car] = await db
      .update(cars)
      .set(data)
      .where(eq(cars.id, id))
      .returning();
    return car;
  },

  async updateCarStatus(id: string, status: "approved" | "rejected") {
    const [car] = await db
      .update(cars)
      .set({ status })
      .where(eq(cars.id, id))
      .returning();
    return car;
  },

  async deleteCar(id: string) {
    await db.delete(cars).where(eq(cars.id, id));
  },

  async getBlogPosts() {
    return await db.select().from(blogPosts);
  },

  async getBlogPostById(id: string) {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);
    return post;
  },

  async getBlogPostBySlug(slug: string) {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);
    return post;
  },

  async createBlogPost(data: InsertBlogPost) {
    const [post] = await db.insert(blogPosts).values(data).returning();
    return post;
  },

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>) {
    const [post] = await db
      .update(blogPosts)
      .set(data)
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  },

  async deleteBlogPost(id: string) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  },

  async getContactMessages() {
    return await db.select().from(contactMessages);
  },

  async createContactMessage(data: InsertContactMessage) {
    const messageData = {
      ...data,
      date: new Date().toISOString(),
    };
    const [message] = await db
      .insert(contactMessages)
      .values(messageData)
      .returning();
    return message;
  },

  async deleteContactMessage(id: string) {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  },
};
