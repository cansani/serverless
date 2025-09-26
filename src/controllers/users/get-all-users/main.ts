import { APIGatewayEvent } from 'aws-lambda';
import { findMany } from '../../../repositories/users-repository';
import z, { ZodError } from 'zod';
import { env } from '../../../env';

export const getAllUsers = async (_event: APIGatewayEvent) => {
  try {
    const users = await findMany();

    if (!users) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Failed to fetch users.',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation error.',
          issues: z.prettifyError(err),
        }),
      };
    }

    if (env.NODE_ENV === 'dev') {
      console.error(err);
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error.',
      }),
    };
  }
};
