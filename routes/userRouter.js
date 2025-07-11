import express from 'express';
import {
    registerWrapper,
    loginWrapper,
    logoutWrapper,
    getCurrentUserWrapper,
    updateAvatarWrapper,
    getFollowersWrapper,
    getFollowingsWrapper,
    followUserWrapper
} from '../controllers/usersController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { upload, resizeAvatar } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerWrapper);
router.post('/login', loginWrapper);
router.post('/logout', authMiddleware, logoutWrapper);
router.get('/current', authMiddleware, getCurrentUserWrapper);
router.patch(
    '/avatars',
    authMiddleware,
    upload.single('avatar'),
    resizeAvatar,
    updateAvatarWrapper
);
router.get("/followers", authMiddleware, getFollowersWrapper);
router.get("/followings", authMiddleware, getFollowingsWrapper);
router.post("/follow", authMiddleware, followUserWrapper);


export default router;
