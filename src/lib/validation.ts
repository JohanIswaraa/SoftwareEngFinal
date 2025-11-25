import { z } from 'zod';

export const internshipSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  company: z.string().trim().min(1, 'Company is required').max(200, 'Company must be less than 200 characters'),
  location: z.string().trim().min(1, 'Location is required').max(200, 'Location must be less than 200 characters'),
  duration: z.string().trim().min(1, 'Duration is required'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  major: z.array(z.string()).min(1, 'At least one major is required'),
  industry: z.array(z.string()).min(1, 'At least one industry is required'),
  applicationMethod: z.enum(['external', 'email']),
  applicationValue: z.string().trim().min(1, 'Application value is required'),
  listingDuration: z.number().min(1).max(24).optional(),
  imageUrl: z.string().optional(),
});

export const authSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().trim().min(1, 'Name is required').optional(),
});

export type InternshipFormData = z.infer<typeof internshipSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
