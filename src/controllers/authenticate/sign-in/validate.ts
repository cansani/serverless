import z from "zod";

export const requestSchema = z.object({
    name: z.string().min(3),
    password: z.string().min(6)
})
