import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  method: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const payload: ErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      payload.statusCode = status;

      if (typeof body === 'string') {
        payload.message = body;
        payload.error = exception.message;
      } else if (typeof body === 'object' && body !== null) {
        const record = body as Record<string, unknown>;
        payload.message =
          (record['message'] as string | string[]) ?? exception.message;
        payload.error = (record['error'] as string) ?? exception.message;
      }
    } else if (exception instanceof Error) {
      payload.message = exception.message;
      payload.error = exception.name;
      this.logger.error(
        `Unhandled ${exception.name}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unhandled non-Error exception', String(exception));
    }

    response.status(payload.statusCode).json(payload);
  }
}