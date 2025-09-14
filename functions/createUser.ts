import { APIGatewayEvent } from "aws-lambda";
import { mongoConnection } from "../lib/mongo-connection";

export const createUser = async (event: APIGatewayEvent) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing body."
                })
            }
        }

        const body = JSON.parse(event.body)

        if (!body.name || !body.password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Fields is required."
                })
            }
        }

        const db = await mongoConnection()
        const usersCollection = db.collection("users")
        const document = {
            name: body.name,
            password: body.password
        }
        
        await usersCollection.insertOne(document) 

        return {
            statusCode: 201
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error."
            })
        }
    }
};
