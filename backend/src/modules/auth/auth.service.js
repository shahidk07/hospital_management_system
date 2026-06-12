import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database.js';
import AppError from '../../utils/AppError.js';
import logAudit from '../../utils/auditLogger.js';

const SALT_ROUNDS = 12;

function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
}

export const authService = {
  register: async (data, req) => {
    const { email, password, firstName, lastName, dateOfBirth, gender, phone, address } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create User and PatientProfile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'PATIENT'
        }
      });

      const patientProfile = await tx.patientProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          phone,
          address
        }
      });

      return { user, patientProfile };
    });

    const userPayload = { id: result.user.id, email: result.user.email, role: result.user.role };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: result.user.id,
        expiresAt
      }
    });

    // Log audit trail
    await logAudit({
      userId: result.user.id,
      action: 'PATIENT_CREATED',
      entityType: 'PatientProfile',
      entityId: result.patientProfile.id,
      metadata: { patientId: result.patientProfile.id, createdBy: 'SELF' },
      req
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        patientProfileId: result.patientProfile.id
      },
      accessToken,
      refreshToken
    };
  },

  login: async ({ email, password }, req) => {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patientProfile: { select: { id: true } },
        doctorProfile: { select: { id: true } }
      }
    });

    // Return generic error for invalid credentials
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const userPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    // Log audit trail
    await logAudit({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      metadata: { role: user.role, email: user.email },
      req
    });

    const profileId = user.role === 'PATIENT' 
      ? user.patientProfile?.id 
      : user.role === 'DOCTOR' 
        ? user.doctorProfile?.id 
        : null;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId
      },
      accessToken,
      refreshToken
    };
  },

  refresh: async (token) => {
    // Find refresh token in DB
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      if (dbToken) {
        // Delete expired token
        await prisma.refreshToken.delete({ where: { token } }).catch(() => {});
      }
      throw new AppError('Refresh token expired or invalid', 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw new AppError('Refresh token expired or invalid', 401);
    }

    // Issue new tokens (Token rotation)
    const userPayload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const accessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken(userPayload);

    // Swap refresh tokens
    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: decoded.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  },

  logout: async (token, req) => {
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (dbToken) {
      await prisma.refreshToken.delete({ where: { token } }).catch(() => {});
      
      let decoded;
      try {
        decoded = jwt.decode(token);
      } catch (err) {}

      if (decoded) {
        await logAudit({
          userId: decoded.id,
          action: 'LOGOUT',
          entityType: 'User',
          entityId: decoded.id,
          metadata: { role: decoded.role },
          req
        });
      }
    }
  },

  getMe: async (userId, role) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        patientProfile: true,
        doctorProfile: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  createDoctor: async (data, req) => {
    const { email, password, firstName, lastName, specialization, departmentId, phone, licenseNumber } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Check if license number already exists
    const existingLicense = await prisma.doctorProfile.findUnique({ where: { licenseNumber } });
    if (existingLicense) {
      throw new AppError('Doctor with this license number already exists', 409);
    }

    // Verify department exists
    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'DOCTOR'
        }
      });

      const doctorProfile = await tx.doctorProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          specialization,
          departmentId,
          phone,
          licenseNumber
        }
      });

      return { user, doctorProfile };
    });

    // Log audit trail
    await logAudit({
      userId: req.user.id, // The admin creator
      action: 'DOCTOR_CREATED',
      entityType: 'DoctorProfile',
      entityId: result.doctorProfile.id,
      metadata: {
        doctorId: result.doctorProfile.id,
        departmentId,
        specialization
      },
      req
    });

    return {
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
      doctorProfile: result.doctorProfile
    };
  }
};

export default authService;
