import { APIGatewayEvent } from "aws-lambda";
import { updateUser } from "./main";

export const handler = async (event: APIGatewayEvent) => {
    return updateUser(event)
}
