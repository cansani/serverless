import { APIGatewayEvent } from "aws-lambda";
import { getAuthenticatedUser } from "./main";

export const handler = async (event: APIGatewayEvent) => {
    return getAuthenticatedUser(event)
}
