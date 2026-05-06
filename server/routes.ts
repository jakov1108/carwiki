import type { Express, Request, Response, NextFunction } from "express";
import { storage, generateSlug } from "./storage";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import {
  insertCarSchema,
  insertCarModelSchema,
  insertCarGenerationSchema,
  insertCarVariantSchema,
  insertBlogPostSchema,
  insertContactMessageSchema,
  insertImageSchema,
  type GenerationPagePayload,
  type ModelPagePayload,
  type VariantPagePayload,
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
  
  const user = session.user as typeof session.user & { role?: string };

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  (req as any).session = session;
  next();
}

const PUBLIC_CACHE_PROFILES = {
  catalog: "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400",
  detail: "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400",
  search: "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
} as const;

type PublicCacheProfile = keyof typeof PUBLIC_CACHE_PROFILES;

function setPublicCache(res: Response, profile: PublicCacheProfile = "detail") {
  res.setHeader("Cache-Control", PUBLIC_CACHE_PROFILES[profile]);
}

function buildGalleryImages(primaryImage: string | null | undefined, imageList: Array<{ url: string }>) {
  const urls = [
    primaryImage,
    ...imageList.map((image) => image.url),
  ].filter((url): url is string => typeof url === "string" && url.length > 0);

  return Array.from(new Set(urls));
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
      setPublicCache(res, "catalog");
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car models" });
    }
  });

  // Get all unique brands
  app.get("/api/brands", async (_req: Request, res: Response) => {
    try {
      const brands = await storage.getBrands();
      setPublicCache(res, "catalog");
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Get models by brand slug
  app.get("/api/brands/:brandSlug/models", async (req: Request, res: Response) => {
    try {
      const models = await storage.getModelsByBrand(req.params.brandSlug);
      setPublicCache(res, "detail");
      res.json(models);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.get("/api/models/:id", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelById(req.params.id);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }
      setPublicCache(res, "detail");
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car model" });
    }
  });

  app.get("/api/page/model/:id", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelById(req.params.id);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }

      const [generations, imageList] = await Promise.all([
        storage.getCarGenerationsByModelId(model.id),
        storage.getImagesByEntity("model", model.id),
      ]);

      const payload: ModelPagePayload = {
        model,
        generations,
        galleryImages: buildGalleryImages(model.image, imageList),
      };

      setPublicCache(res, "detail");
      res.json(payload);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch model page data" });
    }
  });

  app.get("/api/page/car/:brandSlug/:modelSlug", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelBySlug(req.params.brandSlug, req.params.modelSlug);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }

      const [generations, imageList] = await Promise.all([
        storage.getCarGenerationsByModelId(model.id),
        storage.getImagesByEntity("model", model.id),
      ]);

      const payload: ModelPagePayload = {
        model,
        generations,
        galleryImages: buildGalleryImages(model.image, imageList),
      };

      setPublicCache(res, "detail");
      res.json(payload);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch model page data" });
    }
  });

  // Get model by slug (for dynamic routing)
  app.get("/api/car/:brandSlug/:modelSlug", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelBySlug(req.params.brandSlug, req.params.modelSlug);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }
      setPublicCache(res, "detail");
      res.json(model);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car model" });
    }
  });

  app.get("/api/page/generation/:id", async (req: Request, res: Response) => {
    try {
      const generation = await storage.getCarGenerationById(req.params.id);
      if (!generation) {
        return res.status(404).json({ message: "Car generation not found" });
      }

      const [variants, imageList] = await Promise.all([
        storage.getCarVariantsByGenerationId(generation.id),
        storage.getImagesByEntity("generation", generation.id),
      ]);

      const payload: GenerationPagePayload = {
        generation,
        variants,
        galleryImages: buildGalleryImages(generation.image, imageList),
      };

      setPublicCache(res, "detail");
      res.json(payload);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch generation page data" });
    }
  });

  app.get("/api/page/car/:brandSlug/:modelSlug/:generationSlug", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelBySlug(req.params.brandSlug, req.params.modelSlug);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }

      const generation = await storage.getCarGenerationBySlug(model.id, req.params.generationSlug);
      if (!generation) {
        return res.status(404).json({ message: "Car generation not found" });
      }

      const [variants, imageList] = await Promise.all([
        storage.getCarVariantsByGenerationId(generation.id),
        storage.getImagesByEntity("generation", generation.id),
      ]);

      const payload: GenerationPagePayload = {
        generation,
        variants,
        galleryImages: buildGalleryImages(generation.image, imageList),
      };

      setPublicCache(res, "detail");
      res.json(payload);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch generation page data" });
    }
  });

  // Get generation by slug
  app.get("/api/car/:brandSlug/:modelSlug/:generationSlug", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelBySlug(req.params.brandSlug, req.params.modelSlug);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }
      const generation = await storage.getCarGenerationBySlug(model.id, req.params.generationSlug);
      if (!generation) {
        return res.status(404).json({ message: "Car generation not found" });
      }
      setPublicCache(res, "detail");
      res.json(generation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car generation" });
    }
  });

  app.get("/api/page/variant/:id", async (req: Request, res: Response) => {
    try {
      const variant = await storage.getCarVariantById(req.params.id);
      if (!variant) {
        return res.status(404).json({ message: "Car variant not found" });
      }

      const imageList = await storage.getImagesByEntity("variant", variant.id);
      const payload: VariantPagePayload = {
        variant,
        galleryImages: buildGalleryImages(variant.generation?.image, imageList),
      };

      setPublicCache(res, "detail");
      res.json(payload);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch variant page data" });
    }
  });

  app.get("/api/page/car/:brandSlug/:modelSlug/:generationSlug/:variantSlug", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelBySlug(req.params.brandSlug, req.params.modelSlug);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }

      const generation = await storage.getCarGenerationBySlug(model.id, req.params.generationSlug);
      if (!generation) {
        return res.status(404).json({ message: "Car generation not found" });
      }

      const variant = await storage.getCarVariantBySlug(generation.id, req.params.variantSlug);
      if (!variant) {
        return res.status(404).json({ message: "Car variant not found" });
      }

      const imageList = await storage.getImagesByEntity("variant", variant.id);
      const payload: VariantPagePayload = {
        variant,
        galleryImages: buildGalleryImages(variant.generation?.image, imageList),
      };

      setPublicCache(res, "detail");
      res.json(payload);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch variant page data" });
    }
  });

  // Get variant by slug
  app.get("/api/car/:brandSlug/:modelSlug/:generationSlug/:variantSlug", async (req: Request, res: Response) => {
    try {
      const model = await storage.getCarModelBySlug(req.params.brandSlug, req.params.modelSlug);
      if (!model) {
        return res.status(404).json({ message: "Car model not found" });
      }
      const generation = await storage.getCarGenerationBySlug(model.id, req.params.generationSlug);
      if (!generation) {
        return res.status(404).json({ message: "Car generation not found" });
      }
      const variant = await storage.getCarVariantBySlug(generation.id, req.params.variantSlug);
      if (!variant) {
        return res.status(404).json({ message: "Car variant not found" });
      }
      setPublicCache(res, "detail");
      res.json(variant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car variant" });
    }
  });

  app.post("/api/models", isAdmin, async (req: Request, res: Response) => {
    try {
      const modelData = insertCarModelSchema.parse(req.body);
      // Auto-generate slugs if not provided
      const dataWithSlugs = {
        ...modelData,
        brandSlug: modelData.brandSlug || generateSlug(modelData.brand),
        modelSlug: modelData.modelSlug || generateSlug(modelData.model),
      };
      const model = await storage.createCarModel(dataWithSlugs);
      res.json(model);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.put("/api/models/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const modelData = insertCarModelSchema.partial().parse(req.body);
      // Auto-generate slugs if brand/model changed
      const dataWithSlugs: any = { ...modelData };
      if (modelData.brand) dataWithSlugs.brandSlug = generateSlug(modelData.brand);
      if (modelData.model) dataWithSlugs.modelSlug = generateSlug(modelData.model);
      const model = await storage.updateCarModel(req.params.id, dataWithSlugs);
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
      setPublicCache(res, "catalog");
      res.json(generations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car generations" });
    }
  });

  app.get("/api/models/:modelId/generations", async (req: Request, res: Response) => {
    try {
      const generations = await storage.getCarGenerationsByModelId(req.params.modelId);
      setPublicCache(res, "detail");
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
      setPublicCache(res, "detail");
      res.json(generation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car generation" });
    }
  });

  app.post("/api/generations", isAdmin, async (req: Request, res: Response) => {
    try {
      const generationData = insertCarGenerationSchema.parse(req.body);
      // Auto-generate slug if not provided
      const dataWithSlug = {
        ...generationData,
        slug: generationData.slug || generateSlug(generationData.name),
      };
      const generation = await storage.createCarGeneration(dataWithSlug);
      res.json(generation);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.put("/api/generations/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const generationData = insertCarGenerationSchema.partial().parse(req.body);
      // Auto-generate slug if name changed
      const dataWithSlug: any = { ...generationData };
      if (generationData.name) dataWithSlug.slug = generateSlug(generationData.name);
      const generation = await storage.updateCarGeneration(req.params.id, dataWithSlug);
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
      setPublicCache(res, "catalog");
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car variants" });
    }
  });

  // Advanced search/filter for variants
  app.get("/api/variants/search", async (req: Request, res: Response) => {
    try {
      const filters: Parameters<typeof storage.searchVariants>[0] = {};
      if (typeof req.query.search === 'string' && req.query.search) filters.search = req.query.search;
      if (typeof req.query.brand === 'string' && req.query.brand) filters.brand = req.query.brand;
      if (typeof req.query.category === 'string' && req.query.category) filters.category = req.query.category;
      if (typeof req.query.fuelType === 'string' && req.query.fuelType) filters.fuelType = req.query.fuelType;
      if (typeof req.query.driveType === 'string' && req.query.driveType) filters.driveType = req.query.driveType;
      if (typeof req.query.transmission === 'string' && req.query.transmission) filters.transmission = req.query.transmission;
      if (req.query.powerMin) { const n = Number(req.query.powerMin); if (!isNaN(n)) filters.powerMin = n; }
      if (req.query.powerMax) { const n = Number(req.query.powerMax); if (!isNaN(n)) filters.powerMax = n; }
      if (req.query.yearMin) { const n = Number(req.query.yearMin); if (!isNaN(n)) filters.yearMin = n; }
      if (req.query.yearMax) { const n = Number(req.query.yearMax); if (!isNaN(n)) filters.yearMax = n; }
      const results = await storage.searchVariants(filters);
      setPublicCache(res, "search");
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search variants" });
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
      setPublicCache(res, "detail");
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
      setPublicCache(res, "detail");
      res.json(variant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch car variant" });
    }
  });

  app.post("/api/variants", isAdmin, async (req: Request, res: Response) => {
    try {
      const variantData = insertCarVariantSchema.parse(req.body);
      // Auto-generate slug if not provided
      const dataWithSlug = {
        ...variantData,
        slug: variantData.slug || generateSlug(variantData.engineName),
        status: "approved",
      };
      const variant = await storage.createCarVariant(dataWithSlug);
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
      // Auto-generate slug if not provided
      const dataWithSlug = {
        ...variantData,
        slug: variantData.slug || generateSlug(variantData.engineName),
        status: "pending",
        submittedBy: session.user.id,
        submittedByName: session.user.name || session.user.email,
      };
      const variant = await storage.createCarVariant(dataWithSlug);
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
      // Auto-generate slug if engineName changed
      const dataWithSlug: any = { ...variantData };
      if (variantData.engineName) dataWithSlug.slug = generateSlug(variantData.engineName);
      const variant = await storage.updateCarVariant(req.params.id, dataWithSlug);
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
      setPublicCache(res, "catalog");
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
      setPublicCache(res, "detail");
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
      setPublicCache(res, "catalog");
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
    try {
      // Try to find by slug first, then by ID for backwards compatibility
      let post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        post = await storage.getBlogPostById(req.params.slug);
      }
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      setPublicCache(res, "detail");
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog", isAdmin, async (req: Request, res: Response) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const dataWithSlug = {
        ...postData,
        slug: postData.slug || generateSlug(postData.title),
      };
      const post = await storage.createBlogPost(dataWithSlug);
      res.json(post);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.put("/api/blog/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const postData = insertBlogPostSchema.partial().parse(req.body);
      const dataWithSlug: any = { ...postData };
      if (postData.title) dataWithSlug.slug = generateSlug(postData.title);
      const post = await storage.updateBlogPost(req.params.id, dataWithSlug);
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

  // ========== IMAGES API ==========
  app.get("/api/images/:entityType/:entityId", async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      const imageList = await storage.getImagesByEntity(entityType, entityId);
      setPublicCache(res, "detail");
      res.json(imageList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch images" });
    }
  });

  app.post("/api/images", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const imageData = insertImageSchema.parse(req.body);
      const image = await storage.addImage(imageData);
      res.json(image);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.post("/api/images/bulk", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { entityType, entityId, images: imageList } = req.body;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "entityType and entityId are required" });
      }
      
      if (!Array.isArray(imageList)) {
        return res.status(400).json({ message: "Images must be an array" });
      }
      
      // First, delete existing images for this entity
      await storage.deleteImagesByEntity(entityType, entityId);
      
      // Then add the new images
      const imagesToAdd = imageList.map((img: any, index: number) => ({
        entityType,
        entityId,
        url: img.url,
        sortOrder: img.order ?? index,
      }));
      
      const result = await storage.addImages(imagesToAdd);
      res.json(result);
    } catch (error: any) {
      const validationError = fromError(error);
      res.status(400).json({ message: validationError.toString() });
    }
  });

  app.delete("/api/images/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      await storage.deleteImage(req.params.id);
      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  app.delete("/api/images/:entityType/:entityId", isAdmin, async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.params;
      await storage.deleteImagesByEntity(entityType, entityId);
      res.json({ message: "Images deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete images" });
    }
  });

  app.post("/api/upload-image", isAuthenticated, (req: Request, res: Response) => {
    handleImageUpload(req, res);
  });

  app.get("/uploads/:filename", (req: Request, res: Response) => {
    serveUploadedImage(req, res);
  });

  // ========== CAR SUBMISSIONS API ==========
  
  // User submits a new car/variant
  app.post("/api/submissions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      const { mode, model, modelId, generation, generationId, variant } = req.body;

      if (!mode || !variant) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (mode !== "new" && mode !== "existing") {
        return res.status(400).json({ message: "Invalid submission mode" });
      }

      if (mode === "new" && !model) {
        return res.status(400).json({ message: "New submissions require model data" });
      }

      if (mode === "existing" && !modelId) {
        return res.status(400).json({ message: "Existing submissions require a model ID" });
      }

      if (!generation && !generationId) {
        return res.status(400).json({ message: "Submission requires either generation data or an existing generation ID" });
      }

      const submission = await storage.createCarSubmission({
        submittedBy: session.user.id,
        submittedByName: session.user.name || session.user.email,
        mode,
        modelId: modelId || null,
        generationId: generationId || null,
        modelData: model ? JSON.stringify(model) : null,
        generationData: generation ? JSON.stringify(generation) : null,
        variantData: JSON.stringify(variant),
        status: "pending",
      });

      res.json(submission);
    } catch (error: any) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // Admin: Get all submissions
  app.get("/api/submissions", isAdmin, async (_req: Request, res: Response) => {
    try {
      const submissions = await storage.getCarSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // User: Get own submissions
  app.get("/api/my-submissions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      const submissions = await storage.getCarSubmissionsByUser(session.user.id);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Admin: Get pending submissions count
  app.get("/api/submissions/pending/count", isAdmin, async (_req: Request, res: Response) => {
    try {
      const submissions = await storage.getPendingCarSubmissions();
      res.json({ count: submissions.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending count" });
    }
  });

  // Admin: Get single submission
  app.get("/api/submissions/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const submission = await storage.getCarSubmissionById(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // Admin: Update pending submission before approval
  app.put("/api/submissions/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const submission = await storage.getCarSubmissionById(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      if (submission.status !== "pending") {
        return res.status(400).json({ message: "Only pending submissions can be edited" });
      }

      const { mode, model, modelId, generation, generationId, variant } = req.body;

      if (mode !== undefined && mode !== "new" && mode !== "existing") {
        return res.status(400).json({ message: "Invalid submission mode" });
      }

      if (variant !== undefined && (!variant || typeof variant !== "object")) {
        return res.status(400).json({ message: "Variant data must be an object" });
      }

      const nextMode = mode ?? submission.mode;
      const nextModelId = modelId !== undefined ? modelId || null : submission.modelId;
      const nextGenerationId = generationId !== undefined ? generationId || null : submission.generationId;
      const nextModelData = model !== undefined ? (model ? JSON.stringify(model) : null) : submission.modelData;
      const nextGenerationData = generation !== undefined
        ? (generation ? JSON.stringify(generation) : null)
        : submission.generationData;
      const nextVariantData = variant !== undefined ? JSON.stringify(variant) : submission.variantData;

      if (nextMode === "new" && !nextModelData) {
        return res.status(400).json({ message: "New submissions require model data" });
      }

      if (nextMode === "existing" && !nextModelId) {
        return res.status(400).json({ message: "Existing submissions require a model ID" });
      }

      if (!nextGenerationData && !nextGenerationId) {
        return res.status(400).json({ message: "Submission requires either generation data or an existing generation ID" });
      }

      const updatedSubmission = await storage.updateCarSubmission(req.params.id, {
        mode: nextMode,
        modelId: nextModelId,
        generationId: nextGenerationId,
        modelData: nextModelData,
        generationData: nextGenerationData,
        variantData: nextVariantData,
      });

      res.json(updatedSubmission);
    } catch (error: any) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Admin: Approve submission (creates model/generation/variant)
  app.post("/api/submissions/:id/approve", isAdmin, async (req: Request, res: Response) => {
    try {
      const submission = await storage.getCarSubmissionById(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      if (submission.status !== "pending") {
        return res.status(400).json({ message: "Submission already processed" });
      }

      let modelId = submission.modelId;
      let generationId = submission.generationId;
      const variantData = JSON.parse(submission.variantData);

      // If new model, create it
      if (submission.mode === "new" && submission.modelData) {
        const modelData = JSON.parse(submission.modelData);
        const modelImages = Array.isArray(modelData.images)
          ? modelData.images.filter((image: any) => typeof image?.url === "string" && image.url.length > 0)
          : [];
        const modelImage = modelData.image || modelImages[0]?.url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";
        const newModel = await storage.createCarModel({
          brand: modelData.brand,
          brandSlug: generateSlug(modelData.brand),
          model: modelData.model,
          modelSlug: generateSlug(modelData.model),
          category: modelData.category,
          description: modelData.description,
          image: modelImage,
        });
        if (modelImages.length > 0) {
          await storage.addImages(modelImages.map((image: any, index: number) => ({
            entityType: "model",
            entityId: newModel.id,
            url: image.url,
            sortOrder: image.order ?? index,
          })));
        }
        modelId = newModel.id;
      }

      if (!modelId) {
        return res.status(400).json({ message: "Cannot approve submission without model data or model ID" });
      }

      // If new generation, create it
      if (submission.generationData) {
        const genData = JSON.parse(submission.generationData);
        const generationImages = Array.isArray(genData.images)
          ? genData.images.filter((image: any) => typeof image?.url === "string" && image.url.length > 0)
          : [];
        const generationImage = genData.image || generationImages[0]?.url || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";
        const newGeneration = await storage.createCarGeneration({
          modelId: modelId,
          name: genData.name,
          slug: generateSlug(genData.name),
          yearStart: genData.yearStart,
          yearEnd: genData.yearEnd || null,
          description: genData.description,
          image: generationImage,
        });
        if (generationImages.length > 0) {
          await storage.addImages(generationImages.map((image: any, index: number) => ({
            entityType: "generation",
            entityId: newGeneration.id,
            url: image.url,
            sortOrder: image.order ?? index,
          })));
        }
        generationId = newGeneration.id;
      }

      if (!generationId) {
        return res.status(400).json({ message: "Cannot approve submission without generation data or generation ID" });
      }

      const {
        id: _ignoredId,
        generationId: _ignoredGenerationId,
        status: _ignoredStatus,
        submittedBy: _ignoredSubmittedBy,
        submittedByName: _ignoredSubmittedByName,
        createdAt: _ignoredCreatedAt,
        ...variantPayload
      } = variantData;

      await storage.createCarVariant({
        ...variantPayload,
        generationId,
        slug: generateSlug(variantData.engineName),
        status: "approved",
        submittedBy: submission.submittedBy,
        submittedByName: submission.submittedByName,
      });

      // Update submission status
      await storage.updateCarSubmissionStatus(submission.id, "approved");

      res.json({ message: "Submission approved successfully" });
    } catch (error: any) {
      console.error("Error approving submission:", error);
      res.status(500).json({ message: "Failed to approve submission" });
    }
  });

  // Admin: Reject submission
  app.post("/api/submissions/:id/reject", isAdmin, async (req: Request, res: Response) => {
    try {
      const { notes } = req.body;
      const submission = await storage.getCarSubmissionById(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      await storage.updateCarSubmissionStatus(submission.id, "rejected", notes);
      res.json({ message: "Submission rejected" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject submission" });
    }
  });

  // Admin: Delete submission
  app.delete("/api/submissions/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      await storage.deleteCarSubmission(req.params.id);
      res.json({ message: "Submission deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete submission" });
    }
  });
}
