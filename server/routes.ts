import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import {
  insertCarSchema,
  insertCarModelSchema,
  insertCarGenerationSchema,
  insertCarVariantSchema,
  insertBlogPostSchema,
  insertContactMessageSchema,
} from "../shared/schema";
import { fromError } from "zod-validation-error";
import { handleImageUpload, serveUploadedImage } from "./imageUpload";

// Middleware to check authentication using Better Auth
async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Attach session to request for later use
  (req as any).session = session;
  next();
}

// Middleware to check admin role
async function isAdmin(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (session.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  (req as any).session = session;
  next();
}

export function registerRoutes(app: Express) {
  // Get current user endpoint
  app.get("/api/user/me", async (req: Request, res: Response) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    
    if (!session) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json(session.user);
  });

  // ========== CAR MODELS ==========
  app.get("/api/models", async (_req: Request, res: Response) => {
    try {
      const models = await storage.getCarModels();
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car models" });
    }
  });

  app.get("/api/models/:id", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelById(req.params.id);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car model" });
    }
  });

  app.post("/api/models", isAdmin, async (req: Request, res: Response) => {
    try {
      const modelData = insertCarModelSchema.parse(req.body);
      const model = await storage.createCarModel(modelData);
      res.json(model);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.put("/api/models/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const modelData = insertCarModelSchema.partial().parse(req.body);
      const model = await storage.updateCarModel(req.params.id, modelData);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }
      res.json(model);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.delete("/api/models/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteCarModel(req.params.id);
      res.json({ message: "Car model deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete car model" });
    }
  });

  // ========== CAR GENERATIONS ==========
  app.get("/api/generations", async (_req: Request, res: Response) => {
    try {
      const generations = await storage.getCarGenerations();
      res.json(generations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car generations" });
    }
  });

  app.get("/api/models/:modelId/generations", async (req: Request, res: Response) => {
    try {
      const generations = await storage.getCarGenerationsByModelId(req.params.modelId);
      res.json(generations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car generations" });
    }
  });

  app.get("/api/generations/:id", async (req: Request, res: Response) => {
    try {
      const generation = await storage.getCarGenerationById(req.params.id);
      if (!generation) {
        return res.status(404).json({ message: "Car generation not found" });
      }
      res.json(generation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car generation" });
    }
  });

  app.post("/api/generations", isAdmin, async (req: Request, res: Response) => {
    try {
      const generationData = insertCarGenerationSchema.parse(req.body);
      const generation = await storage.createCarGeneration(generationData);
      res.json(generation);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.put("/api/generations/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const generationData = insertCarGenerationSchema.partial().parse(req.body);
      const generation = await storage.updateCarGeneration(req.params.id, generationData);
      if (!generation) {
        return res.status(404).json({ message: "Car generation not found" });
      }
      res.json(generation);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.delete("/api/generations/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteCarGeneration(req.params.id);
      res.json({ message: "Car generation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete car generation" });
    }
  });

  // ========== CAR VARIANTS ==========
  app.get("/api/variants", async (_req: Request, res: Response) => {
    try {
      const variants = await storage.getCarVariants();
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car variants" });
    }
  });

  app.get("/api/variants/admin/all", isAdmin, async (_req: Request, res: Response) => {
    try {
      const variants = await storage.getAllCarVariants();
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car variants" });
    }
  });

  app.get("/api/variants/admin/pending", isAdmin, async (_req: Request, res: Response) => {
    try {
      const variants = await storage.getPendingCarVariants();
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending car variants" });
    }
  });

  app.get("/api/generations/:generationId/variants", async (req: Request, res: Response) => {
    try {
      const variants = await storage.getCarVariantsByGenerationId(req.params.generationId);
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car variants" });
    }
  });

  app.get("/api/variants/:id", async (req: Request, res: Response) => {
    try {
      const variant = await storage.getCarVariantById(req.params.id);
      if (!variant) {
        return res.status(404).json({ message: "Car variant not found" });
      }
      res.json(variant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car variant" });
    }
  });

  app.post("/api/variants", isAdmin, async (req: Request, res: Response) => {
    try {
      const variantData = insertCarVariantSchema.parse(req.body);
      const variant = await storage.createCarVariant({ ...variantData, status: "approved" });
      res.json(variant);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.post("/api/variants/submit", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      const variantData = insertCarVariantSchema.parse(req.body);
      const variant = await storage.createCarVariant({
        ...variantData,
        status: "pending",
        submittedBy: session.user.id,
        submittedByName: session.user.name || session.user.email,
      });
      res.json(variant);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.post("/api/variants/:id/status", isAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (status !== "approved" && status !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
      }
      const variant = await storage.updateCarVariantStatus(req.params.id, status);
      if (!variant) {
        return res.status(404).json({ message: "Car variant not found" });
      }
      res.json(variant);
    } catch (error) {
      res.status(500).json({ message: "Failed to update car variant status" });
    }
  });

  app.put("/api/variants/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const variantData = insertCarVariantSchema.partial().parse(req.body);
      const variant = await storage.updateCarVariant(req.params.id, variantData);
      if (!variant) {
        return res.status(404).json({ message: "Car variant not found" });
      }
      res.json(variant);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.delete("/api/variants/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteCarVariant(req.params.id);
      res.json({ message: "Car variant deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete car variant" });
    }
  });

  // ========== LEGACY CAR ENDPOINTS (keeping for backward compatibility) ==========

  app.get("/api/cars", async (_req: Request, res: Response) => {
    try {
      const allCars = await storage.getCars(); // Returns only approved cars
      res.json(allCars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  // Get all cars including pending (admin only)
  app.get("/api/cars/admin/all", isAdmin, async (_req: Request, res: Response) => {
    try {
      const allCars = await storage.getAllCars();
      res.json(allCars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  // Get pending cars (admin only)
  app.get("/api/cars/admin/pending", isAdmin, async (_req: Request, res: Response) => {
    try {
      const pendingCars = await storage.getPendingCars();
      res.json(pendingCars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending cars" });
    }
  });

  app.get("/api/cars/:id", async (req: Request, res: Response) => {
    try {
      const car = await storage.getCarById(req.params.id);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car" });
    }
  });

  // Admin creates car (auto-approved)
  app.post("/api/cars", isAdmin, async (req: Request, res: Response) => {
    try {
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar({ ...carData, status: "approved" });
      res.json(car);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  // User submits car (pending approval)
  app.post("/api/cars/submit", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      const carData = insertCarSchema.parse(req.body);
      const car = await storage.createCar({
        ...carData,
        status: "pending",
        submittedBy: session.user.id,
        submittedByName: session.user.name || session.user.email,
      });
      res.json(car);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  // Approve or reject car (admin only)
  app.post("/api/cars/:id/status", isAdmin, async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (status !== "approved" && status !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
      }
      const car = await storage.updateCarStatus(req.params.id, status);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Failed to update car status" });
    }
  });

  app.put("/api/cars/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const carData = insertCarSchema.partial().parse(req.body);
      const car = await storage.updateCar(req.params.id, carData);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.delete("/api/cars/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteCar(req.params.id);
      res.json({ message: "Car deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete car" });
    }
  });

  app.get("/api/blog", async (_req: Request, res: Response) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req: Request, res: Response) => {
    try {
      const post = await storage.getBlogPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", isAdmin, async (req: Request, res: Response) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.put("/api/blog/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const postData = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(req.params.id, postData);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.delete("/api/blog/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteBlogPost(req.params.id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  app.get("/api/contact", isAdmin, async (_req: Request, res: Response) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.json(message);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.delete("/api/contact/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteContactMessage(req.params.id);
      res.json({ message: "Contact message deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  app.post("/api/upload-image", isAuthenticated, (req: Request, res: Response) => {
    handleImageUpload(req, res);
  });

  app.get("/uploads/:filename", (req: Request, res: Response) => {
    serveUploadedImage(req, res);
  });
}
