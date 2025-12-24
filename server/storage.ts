import { db } from "./db";
import {
  cars,
  blogPosts,
  contactMessages,
  type InsertCar,
  type InsertBlogPost,
  type InsertContactMessage,
} from "../shared/schema";
import { eq, desc } from "drizzle-orm";

export const storage = {
  async getCars() {
    return await db.select().from(cars).orderBy(desc(cars.createdAt));
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
};
