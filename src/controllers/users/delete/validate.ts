import z from "zod";

export const requestDeleteUserSchema = z.object({
    id: z.uuid()
})
