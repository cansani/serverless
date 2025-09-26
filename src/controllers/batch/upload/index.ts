import { APIGatewayEvent } from 'aws-lambda';
import { uploadUsersInBatch } from './main';

export const handler = async (event: APIGatewayEvent) => {
  return uploadUsersInBatch(event);
};
