import { APIGatewayEvent } from "aws-lambda";
import { s3 } from "../lib/s3/connection";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

import testFile from "../users/test-users.json"

export const uploadUsers = async (event: APIGatewayEvent) => {
    try {
        const testFilename = "test-users.json"
        //const filePath = join(__dirname, "../users/", testFilename)
        //const contentFile = await readFile(filePath, "utf-8")

        await s3.send(new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: testFilename,
            Body: JSON.stringify(testFile) //contentFile
        }))

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Upload completed."
            })
        }
    } catch (err) {
        console.error(err)

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Internal Server Error."
            })
        }
    }
}