import { db } from "./db";
import { carModels, carGenerations, carVariants } from "@shared/schema";
import { eq } from "drizzle-orm";

function generateSlug(text: string): string {
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

async function populateSlugs() {
  console.log("🔧 Populating slugs...");

  // Update car models
  const models = await db.select().from(carModels);
  for (const model of models) {
    if (!model.brandSlug || !model.modelSlug) {
      const brandSlug = generateSlug(model.brand);
      const modelSlug = generateSlug(model.model);
      await db.update(carModels)
        .set({ brandSlug, modelSlug })
        .where(eq(carModels.id, model.id));
      console.log(`✅ Updated model: ${model.brand} ${model.model} -> ${brandSlug}/${modelSlug}`);
    }
  }

  // Update car generations
  const generations = await db.select().from(carGenerations);
  for (const gen of generations) {
    if (!gen.slug) {
      const slug = generateSlug(gen.name);
      await db.update(carGenerations)
        .set({ slug })
        .where(eq(carGenerations.id, gen.id));
      console.log(`✅ Updated generation: ${gen.name} -> ${slug}`);
    }
  }

  // Update car variants
  const variants = await db.select().from(carVariants);
  for (const variant of variants) {
    if (!variant.slug) {
      const slug = generateSlug(variant.engineName);
      await db.update(carVariants)
        .set({ slug })
        .where(eq(carVariants.id, variant.id));
      console.log(`✅ Updated variant: ${variant.engineName} -> ${slug}`);
    }
  }

  console.log("🎉 Slug population complete!");
}

populateSlugs().catch(console.error);
