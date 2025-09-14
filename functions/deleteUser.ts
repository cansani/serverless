import { APIGatewayEvent } from "aws-lambda";
import { ObjectId } from "mongodb";
import { mongoConnection } from "../lib/mongo-connection";

export const deleteUser = async (event: APIGatewayEvent) => {
    if (!event.pathParameters) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Missing path parameters"
            })
        }
    }

    if (!ObjectId.isValid(event.pathParameters.id!)) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "User not found."
            })
        }
    }

    try {
        const db = await mongoConnection()
        const usersCollection = db.collection("users")

        await usersCollection.deleteOne({
            _id: new ObjectId(event.pathParameters.id)
        })

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User successfully deleted",
            })
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error"
            })
        }
    }
}