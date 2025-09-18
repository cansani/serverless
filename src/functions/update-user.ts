import { APIGatewayEvent } from "aws-lambda";
import z, { ZodError } from "zod";
import { dynamo } from "../lib/dynamo/dynamo-connection";
import { QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../interfaces/user-interface";

export const updateUser = async (event: APIGatewayEvent) => {
    const requestCreateUserSchema = z.object({
        name: z.string().min(3),
        password: z.string().min(6)
    })

    const updateUserSchema = requestCreateUserSchema.partial().strict()

    const pathParametersSchema = z.object({
        id: z.uuid()
    })

    try {
        const { id } = pathParametersSchema.parse(event.pathParameters)

        const body = JSON.parse(event.body || "{}")

        const { name, password } = updateUserSchema.parse(body)

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

        type UserInput = z.infer<typeof requestCreateUserSchema>

        const updateFields: Partial<UserInput> = {}

        if (name) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Partition key cant be changed."
                })
            }
        }

        if (password) updateFields.password = password

        const updateExpressions: string[] = []
        const expressionsAttValues: Record<string, any> = {}

        for (const [key, value] of Object.entries(updateFields)) {
            updateExpressions.push(`${key} = :${key}`)
            expressionsAttValues[`:${key}`] = value
        }

        const updatedUser = await dynamo.send(new UpdateCommand({
            TableName: "users",
            Key: {
                name: foundUser.name,
                user_id: foundUser.user_id
            },
            UpdateExpression: `SET ${updateExpressions.join(", ")}`,
            ExpressionAttributeValues: expressionsAttValues,
            ReturnValues: "ALL_NEW"
        }))

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User successfully updated",
                user: updatedUser.Attributes
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