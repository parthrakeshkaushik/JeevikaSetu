import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG, RoleType } from '../config.js';
import { AuthUser, AuthenticatedRequest } from '../types/index.js';
import prisma from '../db.js';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'प्रमाणीकरण आवश्यक है / Authentication token required',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as AuthUser;
    
    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        jurisdictionType: true,
        jurisdictionName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: 'उपयोगकर्ता निष्क्रिय या अमान्य है / User account is disabled or invalid',
      });
      return;
    }

    req.user = user as AuthUser;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      message: 'अमान्य या समाप्त टोकन / Invalid or expired authentication token',
    });
  }
};

export const requireRoles = (...allowedRoles: RoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'प्रमाणीकरण आवश्यक है / Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `अनधिकृत पहुंच: आपके पद (${req.user.role}) को इस कार्य की अनुमति नहीं है। / Unauthorized for role ${req.user.role}`,
      });
      return;
    }

    next();
  };
};
