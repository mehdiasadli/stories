import z from 'zod';

export const respond = {
  success<T>(
    data: T,
    message = 'Success'
  ): {
    success: true;
    data: T;
    error: null;
    message: string;
  } {
    return {
      success: true,
      data,
      error: null,
      message,
    };
  },
  error(e: unknown): {
    success: false;
    data: null;
    error: unknown;
    message: string;
  } {
    return {
      success: false,
      data: null,
      error: e,
      message: getErrorMessage(e),
    };
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TResponse<T = any> =
  | {
      success: true;
      data: T;
      error: null;
      message: string;
    }
  | {
      success: false;
      data: null;
      error: unknown;
      message: string;
    };

function getErrorMessage(e: unknown) {
  if (typeof e === 'string') {
    return e;
  }

  if (e instanceof z.ZodError) {
    return e.errors[0].message;
  }

  if (e instanceof Error) {
    return e.message;
  }

  return 'Something went wrong';
}
