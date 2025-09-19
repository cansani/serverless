import { APIGatewayEvent } from "aws-lambda";
import { dynamo } from "../lib/dynamo/dynamo-connection";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const getUsers = async (event: APIGatewayEvent) => {
    try {
        const { Items } = await dynamo.send(new ScanCommand({
            TableName: "users",
            Limit: 20
        }))

        if (!Items || Items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Failed to fetch user."
                })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                Items
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