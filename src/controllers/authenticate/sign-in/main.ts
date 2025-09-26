import { APIGatewayEvent } from 'aws-lambda';
import { requestSchema } from './validate';
import { findUniqueByName } from '../../../repositories/users-repository';
import { sign } from 'jsonwebtoken';
import { env } from '../../../env';
import z, { ZodError } from 'zod';

export const signIn = async (event: APIGatewayEvent) => {
  const body = JSON.parse(event.body || '{}');

  try {
    const { name, password } = requestSchema.parse(body);

    const user = await findUniqueByName(name);

    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid credentials.',
        }),
      };
    }

    const userPassword = user.password;

    if (userPassword !== password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid credentials.',
        }),
      };
    }

    const token = sign(
      {
        id: user.user_id,
      },
      env.JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
      }),
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
        message: 'Internal Server Error',
      }),
    };
  }
};
