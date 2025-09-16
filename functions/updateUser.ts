import { APIGatewayEvent } from "aws-lambda";
import { mongoConnection } from "../lib/mongo-connection";
import { ObjectId } from "mongodb";
import z, { ZodError } from "zod";

export const updateUser = async (event: APIGatewayEvent) => {
    const requestCreateUserSchema = z.object({
        name: z.string().min(3),
        password: z.string().min(6)
    })

    const updateUserSchema = requestCreateUserSchema.partial().strict()

    const pathParametersSchema = z.object({
        id: z.string().refine((id) => ObjectId.isValid(id))
    })

    try {
        const { id } = pathParametersSchema.parse(event.pathParameters)

        const body = JSON.parse(event.body || "{}")

        const { name, password } = updateUserSchema.parse(body)

        const db = await mongoConnection()
        const usersCollection = db.collection("users")

        type UserInput = z.infer<typeof requestCreateUserSchema>

        const updateFields: Partial<UserInput> = {}

        if (name) updateFields.name = name
        if (password) updateFields.password = password

        const updatedUser = await usersCollection.findOneAndUpdate(
            {
                _id: new ObjectId(id)
            },
            {
                $set: updateFields
            },
            {
                returnDocument: "after"
            }
        )

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "User successfully updated",
                user: updatedUser
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