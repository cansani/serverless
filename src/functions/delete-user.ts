import { APIGatewayEvent } from "aws-lambda";
import z, { ZodError } from "zod";
import { dynamo } from "../lib/dynamo-connection";
import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import type { User } from "../interfaces/user-interface";

export const deleteUser = async (event: APIGatewayEvent) => {
    const requestPathParametersSchema = z.object({
        id: z.uuid()
    })

    try {
        const { id } = requestPathParametersSchema.parse(event.pathParameters)

        const { Items } = await dynamo.send(new QueryCommand({
            TableName: "users",
            IndexName: "user_id_gsi",
            KeyConditionExpression: "user_id = :uuid",
            ExpressionAttributeValues: {
                ":uuid": id
            }
        }))

        if (!Items || Items.length > 1) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "This user is not unique.",
                })
            }
        }

        const { name, user_id } = Items[0] as User

        //console.log(user)

        await dynamo.send(new DeleteCommand({
            TableName: "users",
            Key: {
                name,
                user_id
            }
        }))

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User successfully deleted",
            })
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