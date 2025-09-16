import { APIGatewayEvent } from "aws-lambda";
import { JsonWebTokenError, JwtPayload, verify } from "jsonwebtoken"
import { mongoConnection } from "../lib/mongo-connection";
import { ObjectId } from "mongodb";
import z, { ZodError } from "zod";

function verifyJwt(token: string) {
    return verify(token, process.env.JWT_SECRET!) as JwtPayload
}

export const getAuthenticatedUser = async (event: APIGatewayEvent) => {
    const headersSchema = z.object({
        authorization: z.string().startsWith("Bearer ")
    })

    try {
        const { authorization } = headersSchema.parse(event.headers)

        const value = authorization.split(" ")[1]

        const jwtToken = verifyJwt(value)

        const userId = jwtToken.id

        const db = await mongoConnection()
        const usersCollection = db.collection("users")

        if (typeof userId !== "string") {
            throw new Error()
        }

        const user = await usersCollection.findOne({
            _id: new ObjectId(userId)
        })

        return {
            statusCode: 200,
            body: JSON.stringify(user)
        }
    } catch (err) {
        if(err instanceof ZodError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Validation error.",
                    issues: z.prettifyError(err)
                })
            }
        }

        if (err instanceof JsonWebTokenError) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Unauthorized."
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
}