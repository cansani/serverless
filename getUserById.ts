import { APIGatewayEvent } from "aws-lambda"

export const getUserById = async (event: APIGatewayEvent) => {
    if (!event.pathParameters) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Missing path parameters."
            })
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: event.pathParameters.id,
            name: "Username"
        })
    }
}