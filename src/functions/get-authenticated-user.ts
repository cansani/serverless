import { APIGatewayEvent } from "aws-lambda";
import { JsonWebTokenError, JwtPayload, verify } from "jsonwebtoken"
import z, { ZodError } from "zod";
import { dynamo } from "../lib/dynamo-connection";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../interfaces/user-interface";

function verifyJwt(token: string) {
    return verify(token, process.env.JWT_SECRET!) as JwtPayload
}

export const getAuthenticatedUser = async (event: APIGatewayEvent) => {
    const headersSchema = z.object({
        authorization: z.string().startsWith("Bearer ")
    })

    try {
        const { authorization } = headersSchema.parse(event.headers)

        const value = authorization.split(" ")[1]

        const jwtToken = verifyJwt(value)

        const userId = jwtToken.id

        const { Items } = await dynamo.send(new QueryCommand({
            TableName: "users",
            IndexName: "user_id_gsi",
            KeyConditionExpression: "user_id = :uuid",
            ExpressionAttributeValues: {
                ":uuid": userId 
            }
        }))

        //console.log(Items)

        if (!Items || Items.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Failed to fetch user."
                })
            }
        }

        const user = Items[0] as User

        //console.log(user)

        return {
            statusCode: 200,
            body: JSON.stringify(user)
        }
    } catch (err) {
        if(err instanceof ZodError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Validation error.",
                    issues: z.prettifyError(err)
                })
            }
        }

        if (err instanceof JsonWebTokenError) {
            return {
                statusCode: 401,
                body: JSON.stringify({
                    message: "Unauthorized."
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
}