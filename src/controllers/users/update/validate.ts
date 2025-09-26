import z from 'zod';

export const requestUpdateUserSchema = z.object({
  name: z.string().min(3),
  password: z.string().min(6),
});

export const requestUpdatePathParametersSchema = z.object({
  id: z.uuid(),
});

export type UserInput = z.infer<typeof requestUpdateUserSchema>;
