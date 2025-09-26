import { S3Client } from '@aws-sdk/client-s3';

function clientConnection() {
  const client = new S3Client({
    forcePathStyle: true,
    credentials: {
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
    },
    endpoint: 'http://localhost:4569',
  });

  return client;
}

export const s3 = clientConnection();
