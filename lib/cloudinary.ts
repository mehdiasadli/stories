import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';

const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
} as const;

cloudinary.config(cloudinaryConfig);

export interface UploadImageOptions {
  folder?: string;
  publicId?: string;
  overwrite?: boolean;
  transformation?: UploadApiOptions['transformation'];
}

export interface UploadImageResult {
  secureUrl: string;
  publicId: string;
}

export async function uploadImage(
  source: string | Buffer,
  options: UploadImageOptions = {}
): Promise<UploadImageResult> {
  const uploadOptions: UploadApiOptions = {
    folder: options.folder,
    public_id: options.publicId,
    overwrite: options.overwrite ?? true,
    resource_type: 'image',
    transformation: options.transformation,
  };

  if (typeof source === 'string') {
    const result = await cloudinary.uploader.upload(source, uploadOptions);
    return { secureUrl: result.secure_url, publicId: result.public_id };
  }

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, uploadResult) => {
      if (error || !uploadResult) {
        reject(error);
        return;
      }
      resolve(uploadResult);
    });

    uploadStream.end(source);
  });

  return { secureUrl: result.secure_url, publicId: result.public_id };
}

export default cloudinary;

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result.result === 'ok' || result.result === 'not found';
  } catch (_error) {
    return false;
  }
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const uploadIndex = segments.findIndex((s) => s === 'upload');
    if (uploadIndex === -1) return null;
    let rest = segments.slice(uploadIndex + 1); // e.g. ["v123", "folder", "file.jpg"]
    if (rest[0] && /^v\d+$/.test(rest[0])) {
      rest = rest.slice(1);
    }
    if (rest.length === 0) return null;
    const joined = rest.join('/');
    const withoutExt = joined.replace(/\.[^/.]+$/, '');
    return withoutExt;
  } catch (_err) {
    return null;
  }
}
