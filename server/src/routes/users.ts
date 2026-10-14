import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { authenticateToken, requireRoles } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types/index.js';
import { ROLES } from '../config.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// GET /api/users/volunteers - List volunteers available for assignment
router.get(
  '/volunteers',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { block } = req.query;
      const where: any = { role: ROLES.VOLUNTEER, isActive: true };

      const volunteers = await prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          phone: true,
          jurisdictionType: true,
          jurisdictionName: true,
          _count: {
            select: { assignedReports: true },
          },
        },
        orderBy: { fullName: 'asc' },
      });

      res.json({ success: true, volunteers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/users - List all users (System Admin or supervisory roles)
router.get(
  '/',
  authenticateToken,
  requireRoles(ROLES.SYSTEM_ADMIN, ROLES.DM, ROLES.ADM, ROLES.DDC, ROLES.BDO),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          department: true,
          jurisdictionType: true,
          jurisdictionName: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST /api/users - Create new user account (Admin only)
router.post(
  '/',
  authenticateToken,
  requireRoles(ROLES.SYSTEM_ADMIN),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { email, password, fullName, phone, role, department, jurisdictionType, jurisdictionName } = req.body;

      if (!email || !password || !fullName || !role) {
        res.status(400).json({ success: false, message: 'आवश्यक विवरण दर्ज करें' });
        return;
      }

      const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      if (existing) {
        res.status(409).json({ success: false, message: 'यह ईमेल पहले से पंजीकृत है' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          fullName: fullName.trim(),
          phone: phone || null,
          role,
          department: department || null,
          jurisdictionType: jurisdictionType || null,
          jurisdictionName: jurisdictionName || null,
        },
      });

      await AuditService.logSystemAction({
        action: 'USER_CREATE',
        userId: req.user!.id,
        userEmail: req.user!.email,
        userRole: req.user!.role,
        details: `Created new user: ${newUser.fullName} (${newUser.role})`,
      });

      res.status(201).json({
        success: true,
        message: 'नया उपयोगकर्ता सफलतापूर्वक बनाया गया',
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET /api/users/audit-logs - View system audit trail
router.get(
  '/audit-logs',
  authenticateToken,
  requireRoles(ROLES.SYSTEM_ADMIN, ROLES.DM, ROLES.ADM),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const logs = await prisma.systemAuditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      res.json({ success: true, logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
