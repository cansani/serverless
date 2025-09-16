import { APIGatewayEvent } from "aws-lambda";
import { mongoConnection } from "../lib/mongo-connection";
import z, { ZodError } from "zod";

export const createUser = async (event: APIGatewayEvent) => {
    const requestSchema = z.object({
        name: z.string().min(3),
        password: z.string().min(6)
    })

    const body = JSON.parse(event.body || "{}")

    try {
        const { name, password } = requestSchema.parse(body)

        const db = await mongoConnection()
        const usersCollection = db.collection("users")

        const document = {
            name: name,
            password: password
        }
        
        await usersCollection.insertOne(document) 

        return {
            statusCode: 201
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
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error."
            })
        }
    }
};
