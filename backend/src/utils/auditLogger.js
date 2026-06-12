import { auditLogService } from '../modules/audit-logs/audit-logs.service.js';
import logger from './logger.js';

export async function logAudit({ userId, action, entityType, entityId, metadata, req }) {
  try {
    const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
    const userAgent = req?.headers ? req.headers['user-agent'] : null;

    // Call audit log service
    await auditLogService.create({
      userId,
      action,
      entityType,
      entityId,
      ipAddress,
      userAgent,
      metadata
    });
  } catch (error) {
    // Audit failure should not block the primary operation
    logger.error(`Audit log failed for action ${action}:`, error);
  }
}

export default logAudit;
