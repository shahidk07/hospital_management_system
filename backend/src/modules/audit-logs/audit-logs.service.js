import prisma from '../../config/database.js';

export const auditLogService = {
  create: async (data) => {
    return await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        metadata: data.metadata || {}
      }
    });
  },

  getLogs: async (filters = {}, pagination = {}) => {
    const { action, from, to, userId } = filters;
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [items, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    return { items, total };
  },

  getLogById: async (id) => {
    return await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });
  }
};

export default auditLogService;
