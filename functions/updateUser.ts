import { APIGatewayEvent } from "aws-lambda";
import { mongoConnection } from "../lib/mongo-connection";
import { ObjectId } from "mongodb";

export const updateUser = async (event: APIGatewayEvent) => {
    try {
        const db = await mongoConnection()
        const usersCollection = db.collection("users")
        
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing body"
                })
            }
        }

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

        const { name } = JSON.parse(event.body)

        const updatedUser = await usersCollection.findOneAndUpdate(
            {
                _id: new ObjectId(event.pathParameters.id)
            },
            {
                $set: { name }
            },
            {
                returnDocument: "after"
            }
        )

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User successfully updated",
                user: updatedUser
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