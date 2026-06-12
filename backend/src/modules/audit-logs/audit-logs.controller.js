import auditLogService from './audit-logs.service.js';
import { sendSuccess, sendPaginatedSuccess } from '../../utils/apiResponse.js';
import AppError from '../../utils/AppError.js';

export const getLogs = async (req, res, next) => {
  try {
    const { action, from, to, userId, page = 1, limit = 10 } = req.query;
    
    const filters = { action, from, to, userId };
    const pagination = { page, limit };

    const { items, total } = await auditLogService.getLogs(filters, pagination);
    
    sendPaginatedSuccess(res, items, page, limit, total, 'Audit logs retrieved');
  } catch (error) {
    next(error);
  }
};

export const getLogById = async (req, res, next) => {
  try {
    const log = await auditLogService.getLogById(req.params.id);
    if (!log) {
      throw new AppError('Audit log not found', 404);
    }
    sendSuccess(res, log, 'Audit log retrieved');
  } catch (error) {
    next(error);
  }
};
