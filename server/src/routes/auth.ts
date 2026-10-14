import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import { CONFIG, ROLES } from '../config.js';
import { authenticateToken } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'ईमेल और पासवर्ड आवश्यक हैं / Email and password required',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'अमान्य क्रेडेंशियल्स / Invalid email or password',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'अमान्य क्रेडेंशियल्स / Invalid email or password',
      });
      return;
    }

    const payload = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      jurisdictionType: user.jurisdictionType,
      jurisdictionName: user.jurisdictionName,
    };

    const token = jwt.sign(payload, CONFIG.JWT_SECRET, { expiresIn: '7d' });

    // Log login in system audit
    await AuditService.logSystemAction({
      action: 'LOGIN',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: `Successful login as ${user.role} (${user.jurisdictionName || 'District'})`,
    });

    res.json({
      success: true,
      token,
      user: payload,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    success: true,
    user: req.user,
  });
});

// GET /api/auth/demo-users
// Returns the list of demonstration accounts for all 8 roles for rapid evaluation
router.get('/demo-users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        jurisdictionType: true,
        jurisdictionName: true,
      },
      orderBy: { role: 'asc' },
    });

    res.json({
      success: true,
      users,
      defaultPassword: 'password123',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
