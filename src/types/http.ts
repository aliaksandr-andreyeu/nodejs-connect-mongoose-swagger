import { IncomingMessage, ServerResponse } from 'http';
import { NextFunction } from 'connect';

export interface AppError extends Error {
  code?: number;
  // Marks an intentional, client-safe error (set by userError). Errors without
  // this flag are treated as internal 5xx and their message is not exposed.
  expose?: boolean;
}

export interface RequestParams {
  [key: string]: string;
}

export interface AppAuth {
  userId: string;
  email: string;
  refreshJti: string;
}

export interface AppRequest extends IncomingMessage {
  body?: Record<string, unknown>;
  params?: RequestParams;
  query?: Record<string, string>;
  cookies?: Record<string, string>;
  auth?: AppAuth;
}

export type AppResponse = ServerResponse;
export type AppNextFunction = NextFunction;

export type RequestHandler = (req: AppRequest, res: AppResponse, next: AppNextFunction) => void | Promise<void>;

export interface JwtRefreshPayload {
  id: string;
  email: string;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface JwtAccessPayload extends JwtRefreshPayload {
  refreshId?: string;
  createdAt?: Date | string;
}

export interface RouteMethodConfig {
  handler: RequestHandler;
  auth?: boolean;
}

export type RouteMethods = Partial<Record<string, RouteMethodConfig>>;

export type RoutesMap = Record<string, RouteMethods>;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponseBody<T = unknown> {
  data?: T;
  isOk: boolean;
  message: string | null;
  pagination?: Pagination;
}

export interface ServiceResult<T = unknown> {
  response: ApiResponseBody<T>;
  refreshToken?: string;
}
