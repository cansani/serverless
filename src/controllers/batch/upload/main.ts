import { APIGatewayEvent } from "aws-lambda"
import { randomUUID } from "node:crypto";
import { putObject } from "../../../services/s3-service";
import { env } from "../../../env";

export const uploadUsersInBatch = async (event: APIGatewayEvent) => {
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

        if (!fileExtension) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Content-type is missing."
            })
          }
        }

        const encoding = fileInBase64 ? "base64" : "utf-8"
        const fileBuffer = Buffer.from(event.body, encoding)

        const randomId = randomUUID()
        const generateFileName = `users-${randomId}.${fileExtension}`

        const bucketName = env.BUCKET_NAME

        await putObject(bucketName, generateFileName, fileBuffer, contentType)

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
