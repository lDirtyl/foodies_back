import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import HttpError from '../helpers/HttpError.js';

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: folder,
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new HttpError(400, 'Invalid file type. Only JPEG and PNG are allowed.'), false);
  }
};

const createUploader = (folder) => multer({
  storage: createStorage(folder),
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});

export const upload = createUploader('recipes');
export const avatarUploader = createUploader('avatars');

export default upload;
