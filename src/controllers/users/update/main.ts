import { APIGatewayEvent } from "aws-lambda";
import { requestUpdatePathParametersSchema, requestUpdateUserSchema, UserInput } from "./validate";
import { findUniqueById, update } from "../../../repositories/users-repository";
import { env } from "../../../env";
import z, { ZodError } from "zod";

export const updateUser = async (event: APIGatewayEvent) => {
    const body = JSON.parse(event.body || "{}")

    try {
        const { id } = requestUpdatePathParametersSchema.parse(event.pathParameters)
        const updateUserSchema = requestUpdateUserSchema.partial().strict()

        const { name, password } = updateUserSchema.parse(body)

        const user = await findUniqueById(id)

        if (!user) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User not found."
                })
            }
        }

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

        const updatedUser = await update(user, updateExpressions, expressionsAttValues)

        if (!updatedUser) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User not found",
                })
            } 
        }

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