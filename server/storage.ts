import { db } from "./db";
import {
  cars,
  carModels,
  carGenerations,
  carVariants,
  blogPosts,
  contactMessages,
  images,
  carSubmissions,
  type InsertCar,
  type InsertCarModel,
  type InsertCarGeneration,
  type InsertCarVariant,
  type InsertBlogPost,
  type InsertContactMessage,
  type InsertImage,
  type InsertCarSubmission,
  type CarVariantWithDetails,
  type CarGenerationWithModel,
} from "../shared/schema";
import { eq, desc, and, asc, ilike, or, sql, type SQL } from "drizzle-orm";

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

type GenerationRow = {
  generation: typeof carGenerations.$inferSelect;
  model: typeof carModels.$inferSelect;
};

type VariantRow = {
  variant: typeof carVariants.$inferSelect;
  generation: typeof carGenerations.$inferSelect;
  model: typeof carModels.$inferSelect;
};

function mapGenerationRows(rows: GenerationRow[]): CarGenerationWithModel[] {
  return rows.map(({ generation, model }) => ({
    ...generation,
    model,
  }));
}

function mapVariantRows(rows: VariantRow[]): CarVariantWithDetails[] {
  return rows.map(({ variant, generation, model }) => ({
    ...variant,
    generation,
    model,
  }));
}

function combineConditions(conditions: Array<SQL<unknown> | undefined>) {
  const filtered = conditions.filter((condition): condition is SQL<unknown> => condition !== undefined);
  if (filtered.length === 0) return undefined;
  if (filtered.length === 1) return filtered[0];
  return and(...filtered);
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
    return await db.select()
      .from(carModels)
      .where(eq(carModels.brandSlug, brandSlug))
      .orderBy(carModels.model);
  },

  async getCarModelById(id: string) {
    const [model] = await db.select().from(carModels).where(eq(carModels.id, id)).limit(1);
    return model;
  },

  async getCarModelBySlug(brandSlug: string, modelSlug: string) {
    const [model] = await db.select()
      .from(carModels)
      .where(and(
        eq(carModels.brandSlug, brandSlug),
        eq(carModels.modelSlug, modelSlug),
      ))
      .limit(1);
    return model ?? null;
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
    const rows = await db.select({
      generation: carGenerations,
      model: carModels,
    })
      .from(carGenerations)
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .orderBy(desc(carGenerations.yearStart));

    return mapGenerationRows(rows);
  },

  async getCarGenerationsByModelId(modelId: string) {
    const rows = await db.select({
      generation: carGenerations,
      model: carModels,
    })
      .from(carGenerations)
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(eq(carGenerations.modelId, modelId))
      .orderBy(desc(carGenerations.yearStart));

    return mapGenerationRows(rows);
  },

  async getCarGenerationById(id: string) {
    const [row] = await db.select({
      generation: carGenerations,
      model: carModels,
    })
      .from(carGenerations)
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(eq(carGenerations.id, id))
      .limit(1);

    return row ? { ...row.generation, model: row.model } : null;
  },

  async getCarGenerationBySlug(modelId: string, generationSlug: string) {
    const [row] = await db.select({
      generation: carGenerations,
      model: carModels,
    })
      .from(carGenerations)
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(and(
        eq(carGenerations.modelId, modelId),
        eq(carGenerations.slug, generationSlug),
      ))
      .limit(1);

    return row ? { ...row.generation, model: row.model } : null;
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
    const rows = await db.select({
      variant: carVariants,
      generation: carGenerations,
      model: carModels,
    })
      .from(carVariants)
      .innerJoin(carGenerations, eq(carVariants.generationId, carGenerations.id))
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(eq(carVariants.status, "approved"))
      .orderBy(desc(carVariants.createdAt));

    return mapVariantRows(rows);
  },

  async getAllCarVariants() {
    const rows = await db.select({
      variant: carVariants,
      generation: carGenerations,
      model: carModels,
    })
      .from(carVariants)
      .innerJoin(carGenerations, eq(carVariants.generationId, carGenerations.id))
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .orderBy(desc(carVariants.createdAt));

    return mapVariantRows(rows);
  },

  async getPendingCarVariants() {
    const rows = await db.select({
      variant: carVariants,
      generation: carGenerations,
      model: carModels,
    })
      .from(carVariants)
      .innerJoin(carGenerations, eq(carVariants.generationId, carGenerations.id))
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(eq(carVariants.status, "pending"))
      .orderBy(desc(carVariants.createdAt));

    return mapVariantRows(rows);
  },

  async getCarVariantsByGenerationId(generationId: string) {
    const rows = await db.select({
      variant: carVariants,
      generation: carGenerations,
      model: carModels,
    })
      .from(carVariants)
      .innerJoin(carGenerations, eq(carVariants.generationId, carGenerations.id))
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(and(
        eq(carVariants.generationId, generationId),
        eq(carVariants.status, "approved")
      ))
      .orderBy(asc(carVariants.engineName));

    return mapVariantRows(rows);
  },

  async getCarVariantById(id: string) {
    const [row] = await db.select({
      variant: carVariants,
      generation: carGenerations,
      model: carModels,
    })
      .from(carVariants)
      .innerJoin(carGenerations, eq(carVariants.generationId, carGenerations.id))
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(eq(carVariants.id, id))
      .limit(1);

    return row ? { ...row.variant, generation: row.generation, model: row.model } : null;
  },

  async getCarVariantBySlug(generationId: string, variantSlug: string) {
    const [row] = await db.select({
      variant: carVariants,
      generation: carGenerations,
      model: carModels,
    })
      .from(carVariants)
      .innerJoin(carGenerations, eq(carVariants.generationId, carGenerations.id))
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id))
      .where(and(
        eq(carVariants.generationId, generationId),
        eq(carVariants.slug, variantSlug),
        eq(carVariants.status, "approved"),
      ))
      .limit(1);

    return row ? { ...row.variant, generation: row.generation, model: row.model } : null;
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

  // ========== ADVANCED SEARCH ==========
  async searchVariants(filters: {
    search?: string;
    brand?: string;
    category?: string;
    fuelType?: string;
    driveType?: string;
    transmission?: string;
    powerMin?: number;
    powerMax?: number;
    yearMin?: number;
    yearMax?: number;
  }): Promise<CarVariantWithDetails[]> {
    const searchTerm = filters.search?.trim();
    const whereClause = combineConditions([
      eq(carVariants.status, "approved"),
      filters.brand ? eq(carModels.brandSlug, filters.brand) : undefined,
      filters.category ? eq(carModels.category, filters.category) : undefined,
      filters.fuelType ? eq(carVariants.fuelType, filters.fuelType) : undefined,
      filters.driveType ? eq(carVariants.driveType, filters.driveType) : undefined,
      searchTerm
        ? or(
            ilike(carModels.brand, `%${searchTerm}%`),
            ilike(carModels.model, `%${searchTerm}%`),
            ilike(carVariants.engineName, `%${searchTerm}%`),
            ilike(carGenerations.name, `%${searchTerm}%`),
          )
        : undefined,
      filters.transmission === "manual"
        ? sql`(LOWER(${carVariants.transmission}) LIKE '%ručni%' OR LOWER(${carVariants.transmission}) LIKE '%manual%')`
        : undefined,
      filters.transmission === "automatic"
        ? sql`(LOWER(${carVariants.transmission}) NOT LIKE '%ručni%' AND LOWER(${carVariants.transmission}) NOT LIKE '%manual%')`
        : undefined,
      filters.powerMin !== undefined
        ? sql`CAST(NULLIF(regexp_replace(${carVariants.power}, '[^0-9]', '', 'g'), '') AS integer) >= ${filters.powerMin}`
        : undefined,
      filters.powerMax !== undefined
        ? sql`CAST(NULLIF(regexp_replace(${carVariants.power}, '[^0-9]', '', 'g'), '') AS integer) <= ${filters.powerMax}`
        : undefined,
      filters.yearMin !== undefined
        ? sql`COALESCE(${carGenerations.yearEnd}, EXTRACT(YEAR FROM NOW())::integer) >= ${filters.yearMin}`
        : undefined,
      filters.yearMax !== undefined
        ? sql`${carGenerations.yearStart} <= ${filters.yearMax}`
        : undefined,
    ]);

    const baseQuery = db.select({
      variant: carVariants,
      generation: carGenerations,
      model: carModels,
    })
      .from(carVariants)
      .innerJoin(carGenerations, eq(carVariants.generationId, carGenerations.id))
      .innerJoin(carModels, eq(carGenerations.modelId, carModels.id));

    const rows = whereClause
      ? await baseQuery.where(whereClause).orderBy(desc(carVariants.createdAt))
      : await baseQuery.orderBy(desc(carVariants.createdAt));
    return mapVariantRows(rows);
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

  // ========== IMAGES ==========
  async getImagesByEntity(entityType: string, entityId: string) {
    return await db
      .select()
      .from(images)
      .where(and(eq(images.entityType, entityType), eq(images.entityId, entityId)))
      .orderBy(images.sortOrder);
  },

  async addImage(data: InsertImage) {
    const [image] = await db.insert(images).values(data).returning();
    return image;
  },

  async addImages(imageList: InsertImage[]) {
    if (imageList.length === 0) return [];
    const result = await db.insert(images).values(imageList).returning();
    return result;
  },

  async deleteImage(id: string) {
    await db.delete(images).where(eq(images.id, id));
  },

  async deleteImagesByEntity(entityType: string, entityId: string) {
    await db.delete(images).where(
      and(eq(images.entityType, entityType), eq(images.entityId, entityId))
    );
  },

  async updateImageOrder(imageId: string, sortOrder: number) {
    const [image] = await db
      .update(images)
      .set({ sortOrder })
      .where(eq(images.id, imageId))
      .returning();
    return image;
  },

  // ========== CAR SUBMISSIONS ==========
  async getCarSubmissions() {
    return await db.select().from(carSubmissions).orderBy(desc(carSubmissions.createdAt));
  },

  async getCarSubmissionsByUser(userId: string) {
    return await db.select().from(carSubmissions)
      .where(eq(carSubmissions.submittedBy, userId))
      .orderBy(desc(carSubmissions.createdAt));
  },

  async getPendingCarSubmissions() {
    return await db.select().from(carSubmissions)
      .where(eq(carSubmissions.status, "pending"))
      .orderBy(desc(carSubmissions.createdAt));
  },

  async getCarSubmissionById(id: string) {
    const [submission] = await db.select().from(carSubmissions)
      .where(eq(carSubmissions.id, id))
      .limit(1);
    return submission;
  },

  async createCarSubmission(data: InsertCarSubmission) {
    const [submission] = await db.insert(carSubmissions).values(data).returning();
    return submission;
  },

  async updateCarSubmissionStatus(id: string, status: string, adminNotes?: string) {
    const updateData: any = { status };
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    const [submission] = await db.update(carSubmissions)
      .set(updateData)
      .where(eq(carSubmissions.id, id))
      .returning();
    return submission;
  },

  async deleteCarSubmission(id: string) {
    await db.delete(carSubmissions).where(eq(carSubmissions.id, id));
  },
};
