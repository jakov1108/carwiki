import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";

// Supabase client za Storage
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set");
  }
  return createClient(supabaseUrl, supabaseKey);
}

const BUCKET_NAME = "car-images";
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

type DetectedImage = {
  extension: "jpg" | "png" | "gif" | "webp";
  contentType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
};

function detectImageType(buffer: Buffer): DetectedImage | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { extension: "png", contentType: "image/png" };
  }

  if (buffer.length >= 6) {
    const signature = buffer.subarray(0, 6).toString("ascii");
    if (signature === "GIF87a" || signature === "GIF89a") {
      return { extension: "gif", contentType: "image/gif" };
    }
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { extension: "webp", contentType: "image/webp" };
  }

  return null;
}

export async function handleImageUpload(req: Request, res: Response) {
  try {
    const supabase = getSupabaseClient();
    const chunks: Buffer[] = [];
    let totalSize = 0;
    let requestTooLarge = false;
    const declaredContentType = String(req.headers["content-type"] || "").toLowerCase();

    if (!declaredContentType.startsWith("image/") || declaredContentType.includes("svg")) {
      return res.status(415).json({ message: "Upload podržava samo JPG, PNG, GIF i WebP slike" });
    }
    
    req.on("data", (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > MAX_UPLOAD_SIZE) {
        requestTooLarge = true;
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", async () => {
      try {
        if (requestTooLarge) {
          return;
        }

        const buffer = Buffer.concat(chunks);
        const detected = detectImageType(buffer);

        if (!detected) {
          return res.status(415).json({ message: "Neispravan ili nepodržan format slike" });
        }

        const filename = `${randomUUID()}.${detected.extension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filename, buffer, {
            contentType: detected.contentType,
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          return res.status(500).json({ message: "Upload failed: " + error.message });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filename);

        res.json({ 
          success: true,
          imagePath: urlData.publicUrl 
        });
      } catch (err: any) {
        console.error("Upload processing error:", err);
        res.status(500).json({ message: err.message || "Upload failed" });
      }
    });

    req.on("error", (err) => {
      if (requestTooLarge) {
        return res.status(413).json({ message: "Slika mora biti manja od 10MB" });
      }
      console.error("Upload error:", err);
      res.status(500).json({ message: "Upload failed" });
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    res.status(500).json({ message: error.message || "Upload failed" });
  }
}

// Više nije potrebno jer slike dolaze direktno s Supabase CDN-a
export function serveUploadedImage(req: Request, res: Response) {
  res.status(410).json({ message: "Images are now served from Supabase Storage" });
}
