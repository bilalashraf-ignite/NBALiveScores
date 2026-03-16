// Cloudinary configuration for unsigned uploads
// Uploads happen directly from the client to Cloudinary

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "user-avatars",
};

export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export async function uploadToCloudinary(
  file: File
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryConfig.uploadPreset);
  formData.append("folder", "avatars");

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to Cloudinary");
  }

  return response.json();
}
