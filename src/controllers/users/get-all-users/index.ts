import { APIGatewayEvent } from 'aws-lambda';
import { getAllUsers } from './main';

export const handler = async (event: APIGatewayEvent) => {
  return getAllUsers(event);
};
