import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryMiddleware = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const localPath = req.file.path;

  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder: 'recipes',
      resource_type: 'image',
    });

    // Заменяем локальный путь на URL из Cloudinary
    req.file.path = result.secure_url;

    // Удаляем временный файл
    await fs.unlink(localPath);

    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Если не удалось загрузить, удаляем временный файл
    await fs.unlink(localPath);
    next(error);
  }
};

export default cloudinaryMiddleware;
