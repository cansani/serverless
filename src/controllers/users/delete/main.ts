import { APIGatewayEvent } from "aws-lambda";
import { requestDeleteUserSchema } from "./validate";
import { findUniqueById, remove } from "../../../repositories/users-repository";
import z, { ZodError } from "zod";
import { env } from "../../../env";

export const deleteUser = async (event: APIGatewayEvent) => {
    try {
        const { id } = requestDeleteUserSchema.parse(event.pathParameters)

        const user = await findUniqueById(id)

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User not found."
                })
            }
        }

        const sucess = await remove(user.name, user.user_id)

        if (!sucess) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Failed to remove user."
                })
            }
        }

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
