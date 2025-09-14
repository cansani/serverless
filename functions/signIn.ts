import { APIGatewayEvent } from "aws-lambda";
import { mongoConnection } from "../lib/mongo-connection";
import { sign } from "jsonwebtoken"

export const signIn = async (event: APIGatewayEvent) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing body."
            })
        }
    }

    const body = JSON.parse(event.body)
    const { name, password } = body

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
}