import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    let statusCode = 500;
    let message = 'Internal Server Error';
    let stack: string | undefined;
    const error = exception as {
      name?: string;
      message?: string;
      stack?: string;
      statusCode?: number;
      code?: number;
      keyValue?: Record<string, unknown>;
      errors?: Record<string, { message: string }>;
      path?: string;
      value?: unknown;
      response?: unknown;
    };

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      const details =
        typeof body === 'string'
          ? body
          : (body as { message?: string | string[] }).message;
      message = Array.isArray(details) ? details.join(' ') : details ?? exception.message;
    } else if (error.statusCode) {
      statusCode = error.statusCode;
      message = error.message ?? message;
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors ?? {}).map((item) => item.message).join('. ');
    } else if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue ?? {})[0];
      message = field
        ? `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists.`
        : 'Duplicate entry.';
    } else if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${error.path}: ${String(error.value)}`;
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = error.name === 'TokenExpiredError' ? 'Token has expired.' : 'Invalid token.';
    } else if (error.message) {
      message = error.message;
    }

    if (statusCode === 404 && message.startsWith('Cannot ')) {
      message = `Route not found: ${request.method} ${request.originalUrl}`;
    }
    if (statusCode === 500) {
      stack = error.stack;
      console.error(exception);
    }

    const body: { success: false; message: string; stack?: string } = {
      success: false,
      message,
    };
    if (process.env.NODE_ENV === 'development' && stack) body.stack = stack;
    response.status(statusCode).json(body);
  }
}
