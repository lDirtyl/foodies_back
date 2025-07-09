import express from 'express';
import { 
    registerWrapper,
    loginWrapper, 
    logoutWrapper,
    getCurrentUserWrapper
} from '../controllers/usersController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerWrapper);
router.post('/login', loginWrapper);
router.post('/logout', authMiddleware, logoutWrapper);
router.get('/current', authMiddleware, getCurrentUserWrapper);

export default router;
