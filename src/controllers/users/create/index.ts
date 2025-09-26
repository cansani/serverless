import { APIGatewayEvent } from "aws-lambda";
import { createUser } from "./main";

export const handler = async (event: APIGatewayEvent) => {
    return createUser(event)
}
