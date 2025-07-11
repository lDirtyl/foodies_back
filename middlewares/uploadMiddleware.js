import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import HttpError from '../helpers/HttpError.js';

const AVATAR_SIZE = 250;
const TEMP_DIR = path.join(process.cwd(), 'tmp');
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images', 'avatars');

const multerConfig = multer.diskStorage({
    destination: TEMP_DIR,
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(HttpError(400, 'Непідтримуваний формат файлу. Дозволені формати: jpg, jpeg, png'));
    }
};

export const upload = multer({
    storage: multerConfig,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});


export const resizeAvatar = async (req, res, next) => {
    if (!req.file) {
        return next(HttpError(400, 'Файл не завантажено'));
    }

    const { path: tempPath, originalname } = req.file;
    const fileName = `${uuidv4()}${path.extname(originalname)}`;
    const publicPath = path.join(PUBLIC_DIR, fileName);

    try {
        sharp.cache(false);
        await sharp(tempPath).resize(AVATAR_SIZE, AVATAR_SIZE, {
            fit: 'cover',
            position: 'center',
        }).toFile(publicPath);

        try {
            await fs.unlink(tempPath);
        } catch (err) {
            console.error(`Не вдалося видалити тимчасовий файл: ${tempPath}`, err);
        }

    } catch (error) {
        console.error(`Помилка під час обробки файлу: ${tempPath}`, error);
        return next(HttpError(500, 'Помилка обробки файлу'));
    }

    req.file.filename = fileName;
    next();
};