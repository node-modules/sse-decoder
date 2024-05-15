export class APIError extends Error {
  readonly status: number | undefined;
  readonly headers: Headers | undefined;
  readonly error: object | undefined;
  readonly code: string | null | undefined;
  readonly param: string | null | undefined;
  readonly type: string | undefined;

  constructor(
    status: number | undefined,
    error: object | undefined,
    message: string | undefined,
    headers: Headers | undefined,
  ) {
    super(`${APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;

    const data = error as Record<string, any>;
    this.error = data;
    this.code = data?.code;
    this.param = data?.param;
    this.type = data?.type;
  }

  private static makeMessage(
    status: number | undefined,
    error: any,
    message: string | undefined,
  ) {
    const msg = error?.message
      ? typeof error.message === 'string'
        ? error.message
        : JSON.stringify(error.message)
      : error
        ? JSON.stringify(error)
        : message;

    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return '(no status code or body)';
  }

}
