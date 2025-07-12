import express from 'express';
import {
    registerWrapper,
    loginWrapper,
    logoutWrapper,
    getCurrentUserWrapper,
    updateAvatarWrapper,
    getFollowersWrapper,
    getFollowingsWrapper,
    followUserWrapper,
    unfollowUserWrapper,
    getUserDetailsWrapper
} from '../controllers/usersController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { upload, resizeAvatar } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerWrapper);
router.post('/login', loginWrapper);
router.post('/logout', authMiddleware, logoutWrapper);
router.get('/current', authMiddleware, getCurrentUserWrapper);
// Маршрут для оновлення аватара. Приймає JSON { avatarURL: '...' }
router.patch(
    '/avatar',
    authMiddleware,
    updateAvatarWrapper
);
router.get("/followers", authMiddleware, getFollowersWrapper);
router.get("/followings", authMiddleware, getFollowingsWrapper);
router.post("/follow", authMiddleware, followUserWrapper);
router.delete("/follow", authMiddleware, unfollowUserWrapper);
router.get("/:userId/details", authMiddleware, getUserDetailsWrapper);


export default router;
