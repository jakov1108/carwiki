import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import {
  insertCarSchema,
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

  app.post("/api/upload-image", isAuthenticated, (req: Request, res: Response) => {
    handleImageUpload(req, res);
  });

  app.get("/uploads/:filename", (req: Request, res: Response) => {
    serveUploadedImage(req, res);
  });
}
