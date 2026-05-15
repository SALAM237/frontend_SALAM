import { z } from 'zod';
export const roleSchema = z.object({ name:z.string().min(2), permissions:z.array(z.string()).default([]) });
