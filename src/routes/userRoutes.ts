import express from 'express';
import { getSectorManagers, getAllUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Route pour récupérer tous les utilisateurs
router.get('/', authenticateToken, getAllUsers);

// Route pour récupérer les chefs de secteur
router.get('/sector-managers', authenticateToken, getSectorManagers);

export default router; 