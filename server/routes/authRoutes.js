import  { Router } from 'express';
import { signUp,logIn,logOut } from '../controllers/authMiddleware.js';

const router= Router();

router.post('/signup', signUp);
router.post('/login', logIn);
router.get('/logout', logOut);

export default router