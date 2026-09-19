import { NextResponse } from 'next/server';
import crypto from 'crypto';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'prdprrii';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '282318572618753';
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'a8e8XFNMReLvaM5XmAnoHd3tN6k';

export async function POST(request) {
  try {
    let fileToUpload = null;
    let folder = 'bsmart_avatars';

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      fileToUpload = body.image || body.file;
      if (body.folder) folder = body.folder;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') || formData.get('image');
      if (formData.get('folder')) folder = formData.get('folder');

      if (file && typeof file === 'object' && file.arrayBuffer) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const mimeType = file.type || 'image/jpeg';
        fileToUpload = `data:${mimeType};base64,${buffer.toString('base64')}`;
      } else if (typeof file === 'string') {
        fileToUpload = file;
      }
    }

    if (!fileToUpload || typeof fileToUpload !== 'string') {
      return NextResponse.json(
        { success: false, message: 'No image file provided for upload' },
        { status: 400 }
      );
    }

    // Prepare signed Cloudinary upload
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', fileToUpload);
    cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY);
    cloudinaryFormData.append('timestamp', String(timestamp));
    cloudinaryFormData.append('folder', folder);
    cloudinaryFormData.append('signature', signature);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.secure_url) {
      console.error('Cloudinary API upload error:', uploadData);
      return NextResponse.json(
        {
          success: false,
          message: uploadData.error?.message || 'Failed to upload photo to Cloudinary CDN',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
      format: uploadData.format,
      width: uploadData.width,
      height: uploadData.height,
    });
  } catch (error) {
    console.error('Upload route exception:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error during photo upload' },
      { status: 500 }
    );
  }
}
