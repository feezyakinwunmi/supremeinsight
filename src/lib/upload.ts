import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_WIDTH = 2000;

// Shrinks very large photos in the browser before upload so pages stay fast.
async function prepare(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const resizable = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!resizable) return { blob: file, ext, type: file.type || "application/octet-stream" };

  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width <= MAX_WIDTH) return { blob: file, ext, type: file.type };
    const scale = MAX_WIDTH / bitmap.width;
    const canvas = document.createElement("canvas");
    canvas.width = MAX_WIDTH;
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/webp", 0.88));
    if (blob) return { blob, ext: "webp", type: "image/webp" };
  } catch {
    // fall through and upload the original
  }
  return { blob: file, ext, type: file.type };
}

export async function uploadImage(file: File, userId: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_BYTES) throw new Error("Image is larger than 10 MB.");

  const supabase = createClient();
  const { blob, ext, type } = await prepare(file);
  const safe = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "image";
  const path = `${userId}/${Date.now()}-${safe}.${ext}`;

  const { error } = await supabase.storage.from("post-images").upload(path, blob, { contentType: type, cacheControl: "31536000" });
  if (error) throw new Error(error.message);

  return supabase.storage.from("post-images").getPublicUrl(path).data.publicUrl;
}
