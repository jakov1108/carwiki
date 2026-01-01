import "dotenv/config";
import { db } from "./db";
import { blogPosts } from "@shared/schema";
import { eq } from "drizzle-orm";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (č -> c, š -> s, etc.)
    .replace(/[đ]/g, "d")
    .replace(/[ž]/g, "z")
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

async function populateBlogSlugs() {
  console.log("📝 Popunjavam slugove za blog članke...");

  const posts = await db.select().from(blogPosts);

  for (const post of posts) {
    if (!post.slug) {
      const slug = createSlug(post.title);
      await db.update(blogPosts).set({ slug }).where(eq(blogPosts.id, post.id));
      console.log(`✅ ${post.title} -> ${slug}`);
    }
  }

  console.log("\n🎉 Slugovi uspješno dodani!");
}

populateBlogSlugs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Greška:", err);
    process.exit(1);
  });
