import departmentsService from './departments.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getDepartments = async (req, res, next) => {
  try {
    const result = await departmentsService.getDepartments();
    sendSuccess(res, result, 'Departments retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getDoctorsInDepartment = async (req, res, next) => {
  try {
    const result = await departmentsService.getDoctorsInDepartment(req.params.id);
    sendSuccess(res, result, 'Doctors retrieved successfully');
  } catch (error) {
    next(error);
  }
};
