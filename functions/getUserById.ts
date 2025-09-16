import { APIGatewayEvent } from "aws-lambda"
import { mongoConnection } from "../lib/mongo-connection"
import { ObjectId } from "mongodb"
import z, { ZodError } from "zod"

export const getUserById = async (event: APIGatewayEvent) => {
    const requestSchema = z.object({
        id: z.string().refine((id) => {
            return ObjectId.isValid(id)
        })
    })

    try {
        const { id } = requestSchema.parse(event.pathParameters)

        const db = await mongoConnection()
        const usersCollection = db.collection("users")

        const foundUser = await usersCollection.findOne({
            _id: new ObjectId(id)
        })

        if (!foundUser) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "User not found."
                })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(foundUser)
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
                message: "Internal Server Error"
            })
        }
    }
}