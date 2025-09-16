import { APIGatewayEvent } from "aws-lambda";
import { sign } from "jsonwebtoken"
import z, { ZodError } from "zod";
import { dynamo } from "../lib/dynamo-connection";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../interfaces/user-interface";

export const signIn = async (event: APIGatewayEvent) => {
    const requestSchema = z.object({
        name: z.string().min(3),
        password: z.string().min(6)
    })

    const body = JSON.parse(event.body || "{}")

    try {
        const { name, password } = requestSchema.parse(body)

        const { Items } = await dynamo.send(new QueryCommand({
            TableName: "users",
            KeyConditionExpression: "#name = :name",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": name
            }
        }))

        //console.log(Items)

        if (!Items || Items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Invalid credentials."
                })
            }
        }

        const user = Items[0] as User

        const userPassword = user.password

        if (userPassword !== password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Invalid credentials."
                })
            }
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET doesnt exists.")
        }

        const token = sign(
            {
                id: user.user_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        )

        return {
            statusCode: 200,
            body: JSON.stringify({
                token
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
            statusCode: 400,
            body: JSON.stringify({
                message: "Internal Server Error",
            })
        }
    }
}