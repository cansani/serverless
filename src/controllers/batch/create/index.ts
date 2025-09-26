import { S3CreateEvent } from "aws-lambda";
import { createUsersInBatch } from "./main";

export const handler = async (event: S3CreateEvent) => {
    return createUsersInBatch(event)
}
