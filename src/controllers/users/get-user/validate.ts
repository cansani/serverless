import z from 'zod';

export const requestGetUserByIdSchema = z.object({
  id: z.uuid(),
});
