import express from 'express';
import { getBanners, saveBanner, deleteBanner } from '../repositories/banners.repo.js';

const router = express.Router();

// GET /api/banners - list all banners.
router.get('/', async (req, res) => {
  try {
    const result = await getBanners();
    res.json({ data: result });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/banners - create or update a banner.
router.post('/', async (req, res) => {
  try {
    const id = await saveBanner(req.body);
    res.json({ data: { id } });
  } catch (error) {
    console.error('Save banner error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/banners/:id - delete a banner.
router.delete('/:id', async (req, res) => {
  try {
    await deleteBanner(req.params.id);
    res.json({ data: { success: true } });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
