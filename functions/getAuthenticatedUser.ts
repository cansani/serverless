import { APIGatewayEvent } from "aws-lambda";
import { JsonWebTokenError, JwtPayload, verify } from "jsonwebtoken"
import { mongoConnection } from "../lib/mongo-connection";
import { ObjectId } from "mongodb";

function verifyJwt(token: string) {
    return verify(token, process.env.JWT_SECRET!)
}

export const getAuthenticatedUser = async (event: APIGatewayEvent) => {
    const authorizationHeader = event.headers.authorization

    if (!authorizationHeader) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: "Unauthorized."
            })
        }
    }

    const [type, value] = authorizationHeader?.split(" ")

    if (type !== "Bearer" && !value) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                message: "Unauthorized."
            })
        }
    }

    try {
        const jwtToken = verifyJwt(value)

        const userId = (jwtToken as JwtPayload).id

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