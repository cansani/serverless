import { APIGatewayEvent } from "aws-lambda";
import { headersSchema } from "./validate";
import { verifyJwt } from "../../../middlewares/verify-jwt";
import { findUniqueById } from "../../../repositories/users-repository";
import z, { ZodError } from "zod";
import { JsonWebTokenError } from "jsonwebtoken";
import { env } from "../../../env";

export const getAuthenticatedUser = async (event: APIGatewayEvent) => {
    try {
        const { authorization } = headersSchema.parse(event.headers)

        const value = authorization.split(" ")[1]

        const jwtToken = verifyJwt(value)

        const userId = jwtToken.id

        const user = await findUniqueById(userId)

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Failed to fetch user."
                })
            }
        }

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

        if (env.NODE_ENV === "dev") {
            console.error(err)
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error."
            })
        }
    }
}
