import { APIGatewayEvent } from 'aws-lambda';
import { getUserById } from './main';

export const handler = async (event: APIGatewayEvent) => {
  return getUserById(event);
};
