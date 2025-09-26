import { APIGatewayEvent } from "aws-lambda";
import { signIn } from "./main";

export const handler = async (event: APIGatewayEvent) => {
    return signIn(event)
}
