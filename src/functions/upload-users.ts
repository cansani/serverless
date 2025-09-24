import { APIGatewayEvent } from "aws-lambda";
import { s3 } from "../lib/s3/connection";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

//TODO: Validar o content-type

export const uploadUsers = async (event: APIGatewayEvent) => {
    try {
        const fileInBase64 = event.isBase64Encoded
        const contentType = event.headers["content-type"]
        const fileExtension = contentType?.split("/")[1]

        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Failed to upload file."
                })
            }   
        }

        const encoding = fileInBase64 ? "base64" : "utf-8"
        const fileBuffer = Buffer.from(event.body, encoding)

        const randomId = randomUUID()
        const generateFileName = `users-${randomId}.${fileExtension}`

        await s3.send(new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: generateFileName,
            Body: fileBuffer,
            ContentType: contentType
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