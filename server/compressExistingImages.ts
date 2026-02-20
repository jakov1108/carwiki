/**
 * Skripta za kompresiju postojećih slika na Supabase Storageu.
 * 
 * Što radi:
 * 1. Lista sve slike u "car-images" bucketu
 * 2. Svaku sliku PRVO kopira u "car-images-backup" bucket (backup)
 * 3. Kompresira sliku (max 1920×1080, WebP 80% quality)
 * 4. Uploaduje kompresiranu verziju nazad na isto ime
 * 
 * URL-ovi ostaju ISTI — baza se NE dira.
 * Backup bucket sadrži sve originale za svaki slučaj.
 * 
 * Pokretanje:  npx tsx server/compressExistingImages.ts
 * Dry run:     npx tsx server/compressExistingImages.ts --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL i SUPABASE_SERVICE_KEY moraju biti postavljeni u .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SOURCE_BUCKET = "car-images";
const BACKUP_BUCKET = "car-images-backup";
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const QUALITY = 80;
const DRY_RUN = process.argv.includes("--dry-run");

// Formati koje kompresiramo (preskačemo GIF — može biti animiran)
const COMPRESSIBLE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot >= 0 ? filename.substring(lastDot).toLowerCase() : "";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function ensureBackupBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BACKUP_BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BACKUP_BUCKET, {
      public: false, // Backup ne treba biti javno dostupan
    });
    if (error) {
      console.error(`❌ Ne mogu kreirati backup bucket: ${error.message}`);
      process.exit(1);
    }
    console.log(`📁 Kreiran backup bucket: ${BACKUP_BUCKET}`);
  } else {
    console.log(`📁 Backup bucket već postoji: ${BACKUP_BUCKET}`);
  }
}

async function listAllFiles(): Promise<string[]> {
  const allFiles: string[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage
      .from(SOURCE_BUCKET)
      .list("", { limit, offset, sortBy: { column: "name", order: "asc" } });

    if (error) {
      console.error(`❌ Greška pri listanju fajlova: ${error.message}`);
      break;
    }

    if (!data || data.length === 0) break;

    for (const file of data) {
      if (file.name && !file.name.endsWith("/")) {
        allFiles.push(file.name);
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function compressAndReplace(filename: string): Promise<{ saved: number } | null> {
  const ext = getExtension(filename);
  if (!COMPRESSIBLE_EXTENSIONS.includes(ext)) {
    console.log(`  ⏭️  Preskačem (${ext}): ${filename}`);
    return null;
  }

  // 1. Download originala
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from(SOURCE_BUCKET)
    .download(filename);

  if (downloadError || !downloadData) {
    console.error(`  ❌ Download greška za ${filename}: ${downloadError?.message}`);
    return null;
  }

  const originalBuffer = Buffer.from(await downloadData.arrayBuffer());
  const originalSize = originalBuffer.length;

  // 2. Backup original
  if (!DRY_RUN) {
    const { error: backupError } = await supabase.storage
      .from(BACKUP_BUCKET)
      .upload(filename, originalBuffer, {
        contentType: downloadData.type,
        upsert: true,
      });

    if (backupError) {
      console.error(`  ❌ Backup greška za ${filename}: ${backupError.message}`);
      return null; // Ne nastavljaj ako backup nije uspio
    }
  }

  // 3. Kompresija sa sharp
  let compressedBuffer: Buffer;
  try {
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();

    let pipeline = image;

    // Resize samo ako je veća od limita
    if (
      (metadata.width && metadata.width > MAX_WIDTH) ||
      (metadata.height && metadata.height > MAX_HEIGHT)
    ) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: "inside", // Čuva proporcije, nikad ne reže
        withoutEnlargement: true,
      });
    }

    compressedBuffer = await pipeline
      .webp({ quality: QUALITY })
      .toBuffer();
  } catch (err: any) {
    console.error(`  ❌ Kompresija greška za ${filename}: ${err.message}`);
    return null;
  }

  const compressedSize = compressedBuffer.length;

  // Ako kompresirana verzija nije manja, preskoči
  if (compressedSize >= originalSize) {
    console.log(`  ⏭️  Već optimalna (${formatBytes(originalSize)}): ${filename}`);
    return null;
  }

  const saved = originalSize - compressedSize;
  const percentage = ((saved / originalSize) * 100).toFixed(1);

  if (DRY_RUN) {
    console.log(`  🔍 [DRY RUN] ${filename}: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (−${percentage}%)`);
    return { saved };
  }

  // 4. Upload kompresiranu verziju nazad (upsert = true, zamjenjuje original)
  const { error: uploadError } = await supabase.storage
    .from(SOURCE_BUCKET)
    .upload(filename, compressedBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

  if (uploadError) {
    console.error(`  ❌ Upload greška za ${filename}: ${uploadError.message}`);
    return null;
  }

  console.log(`  ✅ ${filename}: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)} (−${percentage}%)`);
  return { saved };
}

async function main() {
  console.log("=".repeat(60));
  console.log(DRY_RUN ? "🔍 DRY RUN — ništa se neće mijenjati" : "🚀 Kompresija postojećih slika");
  console.log("=".repeat(60));

  await ensureBackupBucketExists();

  const files = await listAllFiles();
  console.log(`\n📋 Pronađeno ${files.length} datoteka u "${SOURCE_BUCKET}"\n`);

  if (files.length === 0) {
    console.log("Nema slika za kompresiju.");
    return;
  }

  let totalSaved = 0;
  let compressed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const result = await compressAndReplace(file);
    if (result) {
      totalSaved += result.saved;
      compressed++;
    } else {
      skipped++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`📊 Rezultat:`);
  console.log(`   Komprimirano: ${compressed}`);
  console.log(`   Preskočeno:   ${skipped}`);
  console.log(`   Ukupno ušteđeno: ${formatBytes(totalSaved)}`);
  if (!DRY_RUN && compressed > 0) {
    console.log(`\n💾 Originalne slike su sačuvane u bucketu "${BACKUP_BUCKET}"`);
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Fatalna greška:", err);
  process.exit(1);
});
