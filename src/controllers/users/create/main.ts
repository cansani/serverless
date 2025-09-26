import { APIGatewayEvent } from "aws-lambda";
import { createUserSchema } from "./validate";
import z, { ZodError } from "zod";
import { env } from "../../../env";
import { create, findUniqueByName } from "../../../repositories/users-repository";

export const createUser = async (event: APIGatewayEvent) => {
    const body = JSON.parse(event.body || "{}")

    try {
        const { name, password } = createUserSchema.parse(body)

        const user = await findUniqueByName(name)

        console.log(user)

        if (user) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "User already exists.",
                })
            }
        }

        await create({ name, password })

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
