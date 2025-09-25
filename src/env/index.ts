import z from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["dev", "production"]).default("dev"),
    JWT_SECRET: z.string().min(1),
    BUCKET_NAME: z.string().min(1)
})

export const _env = envSchema.safeParse(process.env)

if (!_env.success) {
    throw new Error("Invalid envs.")
}

export const env = _env.data

