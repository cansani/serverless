import { APIGatewayEvent } from 'aws-lambda';
import { deleteUser } from './main';

export const handler = async (event: APIGatewayEvent) => {
  return deleteUser(event);
};
