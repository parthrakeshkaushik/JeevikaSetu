import { Router, Request, Response } from 'express';
import { BIHAR_GEOGRAPHY, LIVELIHOOD_CATEGORIES } from '../config.js';
import prisma from '../db.js';
import { AiService } from '../services/aiService.js';

const router = Router();

// GET /api/jurisdictions/geography - Public endpoint for location hierarchy
router.get('/geography', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    districts: Object.keys(BIHAR_GEOGRAPHY),
    geography: BIHAR_GEOGRAPHY,
    categories: LIVELIHOOD_CATEGORIES,
  });
});

// GET /api/jurisdictions/directory - Public disaster & recovery service directory
router.get('/directory', async (req: Request, res: Response): Promise<void> => {
  try {
    const { district } = req.query;
    const where: any = { isActive: true };
    if (district && district !== 'ALL') {
      where.OR = [
        { district: district as string },
        { district: 'Bihar' },
      ];
    }

    const directory = await prisma.serviceDirectoryEntry.findMany({
      where,
      orderBy: [{ district: 'asc' }, { department: 'asc' }],
    });

    res.json({
      success: true,
      directory,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/jurisdictions/ai-extract - AI assisted category & entity extraction from voice transcript
router.post('/ai-extract', (req: Request, res: Response): void => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      res.status(400).json({ success: false, message: 'ट्रांसक्रिप्ट आवश्यक है' });
      return;
    }

    const extraction = AiService.extractFromTranscript(transcript);
    res.json({
      success: true,
      extraction,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
