import express from 'express';
const router = express.Router();

// Stub for EMR module routes (owned by Dakshesh Jain)
router.get('/', (req, res) => res.json({ message: 'EMR module stub' }));

export default router;
