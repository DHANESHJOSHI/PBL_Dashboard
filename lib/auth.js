import { z } from 'zod';

export const adminLoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .refine((email) => email.endsWith('@gmail.com'), {
      message: 'Email must be a valid Gmail address',
    }),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(50, 'Password must be less than 50 characters'),
});

export const teamLoginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address'),
  collegeId: z
    .string()
    .min(1, 'College ID is required')
    .max(50, 'College ID must be less than 50 characters'),
});