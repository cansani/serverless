import { s3 } from '../lib/s3/connection';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export async function getObject(bucketName: string, fileName: string) {
  const { Body } = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    })
  );

  if (!Body) {
    return null;
  }

  return Body;
}

export async function putObject(
  bucketName: string,
  key: string,
  body: Buffer,
  contentType: string
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}
