import authService from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body, req);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body, req);
    sendSuccess(res, result, 'Login successful', 200);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    sendSuccess(res, result, 'Token refreshed successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken, req);
    sendSuccess(res, {}, 'Logout successful', 200);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id, req.user.role);
    sendSuccess(res, user, 'Profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const result = await authService.createDoctor(req.body, req);
    sendSuccess(res, result, 'Doctor account created successfully', 201);
  } catch (error) {
    next(error);
  }
};
