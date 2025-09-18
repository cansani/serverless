import { S3CreateEvent } from "aws-lambda";
import { s3 } from "../lib/s3/connection";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { dynamo } from "../lib/dynamo/dynamo-connection";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { csvConverter } from "../utils/csv-converter";

interface RequestUser {
    name: string,
    password: string
}

export const createUsersInBatch = async (event: S3CreateEvent) => {
    try {
        const eventInformations = event.Records[0].s3
        const bucketName = eventInformations.bucket.name
        const fileName = decodeURIComponent(eventInformations.object.key.replace(/\+/g, " "))

        const fileExtension = fileName.split(".").pop()?.toLowerCase()

        const { Body } = await s3.send(new GetObjectCommand({
            Bucket: bucketName,
            Key: fileName
        }))

        if (!Body) {
            throw new Error("No content.")
        }

        const contentFile = await Body.transformToString()

        console.log(contentFile)

        let fileUsers: RequestUser[] = []

        if (fileExtension === "json") {
            fileUsers = JSON.parse(contentFile)
        }

        if (fileExtension === "csv") {
            fileUsers = await csvConverter(contentFile)
        }

        if (fileUsers.length === 0) {
            throw new Error("No content in file.")
        }

        await Promise.all(
            fileUsers.map((item) => {
                return dynamo.send(new PutCommand({
                    TableName: "users",
                    Item: {
                        user_id: randomUUID(),
                        name: item.name,
                        password: item.password
                    }
                }))
            })
        )

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Users successfully imported."
            })
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Failed to import user(s)"
            })
        }
    }
}