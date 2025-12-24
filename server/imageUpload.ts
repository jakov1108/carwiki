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

export async function handleImageUpload(req: Request, res: Response) {
  try {
    const supabase = getSupabaseClient();
    const chunks: Buffer[] = [];
    
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers["content-type"] || "image/jpeg";
        
        let extension = "jpg";
        if (contentType.includes("png")) extension = "png";
        else if (contentType.includes("gif")) extension = "gif";
        else if (contentType.includes("webp")) extension = "webp";

        const filename = `${randomUUID()}.${extension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filename, buffer, {
            contentType,
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
