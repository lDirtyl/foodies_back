import express from 'express';
import { adminController } from '../controllers/adminController.js';

const router = express.Router();

// Basic password protection middleware
const protectWithPassword = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  // In a real app, use a more secure, environment-specific password
  if (token !== 'supersecretpassword') {
    return res.status(403).json({ message: 'Invalid credentials.' });
  }

  next();
};

router.use(protectWithPassword);

router.get('/tables', adminController.getTables);
router.get('/tables/:tableName', adminController.getContent);

export default router;
