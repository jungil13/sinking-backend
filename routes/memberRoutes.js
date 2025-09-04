import express from 'express';
import { getMembers, getMemberTransactions } from '../controllers/memberController.js';
import  auth  from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getMembers);
router.get('/:memberID/transactions', auth, getMemberTransactions);

export default router;
