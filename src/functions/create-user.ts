import { APIGatewayEvent } from "aws-lambda";
import z, { ZodError } from "zod";
import { dynamo } from "../lib/dynamo-connection"; 
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";

export const createUser = async (event: APIGatewayEvent) => {
    const requestSchema = z.object({
        name: z.string().min(3),
        password: z.string().min(6)
    })

    const body = JSON.parse(event.body || "{}")

    try {
        const { name, password } = requestSchema.parse(body)

        const { Items } = await dynamo.send(new QueryCommand({
            TableName: "users",
            KeyConditionExpression: "#name = :nameValue",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":nameValue": name
            }
        }))

        const userExists = Items && Items.length > 0

        if (userExists) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User already exists.",
                })
            }
        }
        
        await dynamo.send(new PutCommand({
            TableName: "users",
            Item: {
                user_id: randomUUID(),
                name,
                password
            }
        }))

        return {
            statusCode: 201
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
                message: "Internal Server Error."
            })
        }
    }
};
