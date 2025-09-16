import { APIGatewayEvent } from "aws-lambda";
import { mongoConnection } from "../lib/mongo-connection";
import { sign } from "jsonwebtoken"
import z, { ZodError } from "zod";

export const signIn = async (event: APIGatewayEvent) => {
    const requestSchema = z.object({
        name: z.string().min(3),
        password: z.string().min(6)
    })

    const body = JSON.parse(event.body || "{}")

    try {
        const { name, password } = requestSchema.parse(body)

        const db = await mongoConnection()
        const collection = db.collection("users")

        const user = await collection.findOne({
            name
        })

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Invalid credentials."
                })
            }
        }

        const userPassword = user.password

        if (userPassword !== password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Invalid credentials."
                })
            }
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET doesnt exists.")
        }

        const token = sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        )

        return {
            statusCode: 200,
            body: JSON.stringify({
                token
            })
        }
    } catch (err) {
        if (err instanceof ZodError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Validation error.",
                    issues: z.prettifyError(err)
                })
            }
        }

        console.error(err)

        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Internal Server Error",
            })
        }
    }
}