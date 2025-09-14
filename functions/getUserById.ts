import { APIGatewayEvent } from "aws-lambda"
import { mongoConnection } from "../lib/mongo-connection"
import { ObjectId } from "mongodb"

export const getUserById = async (event: APIGatewayEvent) => {
    if (!event.pathParameters) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing path parameters."
            })
        }
    }

    const id = event.pathParameters.id!

    if (!ObjectId.isValid(id)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "User not found."
            })
        }
    }

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
}