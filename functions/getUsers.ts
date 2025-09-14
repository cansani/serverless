import { APIGatewayEvent } from "aws-lambda";
import { mongoConnection } from "../lib/mongo-connection";

export const getUsers = async (event: APIGatewayEvent) => {
    try {
        const db = await mongoConnection()
        const collection = db.collection("users")
        const users = await collection.find({}).toArray()

        return {
            statusCode: 200,
            body: JSON.stringify({
                users
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