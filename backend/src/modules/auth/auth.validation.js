import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.preprocess((val) => new Date(val), z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Invalid date format",
  })),
  gender: z.string().min(1, 'Gender is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const createDoctorSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  departmentId: z.string().uuid('Invalid department ID (UUID)'),
  phone: z.string().min(1, 'Phone number is required'),
  licenseNumber: z.string().min(1, 'License number is required')
});
