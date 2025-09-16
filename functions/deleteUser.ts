import { APIGatewayEvent } from "aws-lambda";
import { ObjectId } from "mongodb";
import { mongoConnection } from "../lib/mongo-connection";
import z, { ZodError } from "zod";

export const deleteUser = async (event: APIGatewayEvent) => {
    const requestPathParametersSchema = z.object({
        id: z.string().refine((id) => {
            return ObjectId.isValid(id)
        })
    })

    try {
        const { id } = requestPathParametersSchema.parse(event.pathParameters)

        const db = await mongoConnection()
        const usersCollection = db.collection("users")

        await usersCollection.deleteOne({
            _id: new ObjectId(id)
        })

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User successfully deleted",
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
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error"
            })
        }
    }
}