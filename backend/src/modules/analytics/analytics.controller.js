import analyticsService from './analytics.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview();
    sendSuccess(res, data, 'Overview analytics retrieved');
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 6;
    const data = await analyticsService.getRevenueTrends(months);
    sendSuccess(res, data, 'Revenue trends retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const months = req.query.months ? Number(req.query.months) : 6;
    const data = await analyticsService.getAppointmentTrends(months);
    sendSuccess(res, data, 'Appointment trends retrieved');
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const data = await analyticsService.getDepartmentPerformance();
    sendSuccess(res, data, 'Department performance analytics retrieved');
  } catch (error) {
    next(error);
  }
};
