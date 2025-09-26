import { APIGatewayEvent } from "aws-lambda";
import { requestGetUserByIdSchema } from "./validate";
import { findUniqueById } from "../../../repositories/users-repository";
import { env } from "../../../env";
import z, { ZodError } from "zod";

export const getUserById = async (event: APIGatewayEvent) => {
    try {
        const { id } = requestGetUserByIdSchema.parse(event.pathParameters)

        const user = await findUniqueById(id)

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User not found."
                })
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(user)
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

        if (env.NODE_ENV === "dev") {
            console.error(err)
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error"
            })
        }
    }
}
