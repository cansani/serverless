import { APIGatewayEvent } from "aws-lambda"
import { ObjectId } from "mongodb"
import z, { ZodError } from "zod"
import { dynamo } from "../lib/dynamo/dynamo-connection"
import { QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb"
import { User } from "../interfaces/user-interface"

export const getUserById = async (event: APIGatewayEvent) => {
    const requestSchema = z.object({
        id: z.uuid()
    })

    try {
        const { id } = requestSchema.parse(event.pathParameters)

        const { Items } = await dynamo.send(new QueryCommand({
            TableName: "users",
            IndexName: "user_id_gsi",
            KeyConditionExpression: "user_id = :uuid",
            ExpressionAttributeValues: {
                ":uuid": id
            }
        }))

        const notFoundUser = !Items || Items.length > 1

        if (notFoundUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User not found."
                })
            }
        }

        const foundUser = Items[0] as User

        const { Item } = await dynamo.send(new GetCommand({
            TableName: "users",
            Key: {
                name: foundUser.name,
                user_id: foundUser.user_id
            }
        }))

        return {
            statusCode: 200,
            body: JSON.stringify(Item)
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