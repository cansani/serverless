import { S3CreateEvent } from 'aws-lambda';
import { csvConverter } from '../../../utils/csv-converter';
import { getObject } from '../../../services/s3-service';
import { create } from '../../../repositories/users-repository';

interface RequestUser {
  name: string;
  password: string;
}

export const createUsersInBatch = async (event: S3CreateEvent) => {
  try {
    const eventInformations = event.Records[0].s3;
    const bucketName = eventInformations.bucket.name;
    const fileName = decodeURIComponent(
      eventInformations.object.key.replace(/\+/g, ' ')
    );

    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    const file = await getObject(bucketName, fileName);

    if (!file) {
      throw new Error('File not found.');
    }

    const contentFile = await file.transformToString();

    let fileUsers: RequestUser[] = [];

    if (fileExtension === 'json') {
      fileUsers = JSON.parse(contentFile);
    }

    if (fileExtension === 'csv') {
      fileUsers = await csvConverter(contentFile);
    }

    if (fileUsers.length === 0) {
      throw new Error('File not found.');
    }

    await Promise.all(
      fileUsers.map((item) => {
        return create({
          name: item.name,
          password: item.password,
        });
      })
    );

    return {
      message: 'Users successfully imported.',
    };
  } catch (err) {
    console.error(err);
  }
};
