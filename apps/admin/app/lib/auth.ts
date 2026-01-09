import { createHmac, timingSafeEqual } from 'node:crypto';

import { createApiError, jsonError } from '@repo/core';

import { getAdminEnv } from './env';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  iat: number;
  exp: number;
};

const base64UrlEncode = (value: string): string => Buffer.from(value).toString('base64url');

const base64UrlDecode = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const sign = (value: string, secret: string): string => {
  const signature = createHmac('sha256', secret).update(value).digest();
  return Buffer.from(signature).toString('base64url');
};

export const createAdminSessionToken = (): string => {
  const env = getAdminEnv();
  const now = Date.now();
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_MAX_AGE_MS
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload, env.AUTH_SECRET);

  return `${encodedPayload}.${signature}`;
};

export const verifyAdminSessionToken = (token: string | undefined): boolean => {
  const env = getAdminEnv();
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = sign(encodedPayload, env.AUTH_SECRET);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (Date.now() > payload.exp) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

export const verifyAdminPassword = (password: string | null): boolean =>
  !!password && password === getAdminEnv().ADMIN_PASSWORD;

export const getSessionCookieName = (): string => SESSION_COOKIE_NAME;

export const getSessionMaxAgeSeconds = (): number => Math.floor(SESSION_MAX_AGE_MS / 1000);

export const getSessionTokenFromRequest = (req: Request): string | undefined => {
  const cookieHeader = req.headers.get('cookie');

  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const sessionCookie = cookies.find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) {
    return undefined;
  }

  return sessionCookie.split('=')[1];
};

export const requireAdminSession = (req: Request): Response | null => {
  const token = getSessionTokenFromRequest(req);

  if (!verifyAdminSessionToken(token)) {
    return jsonError(createApiError('UNAUTHORIZED', 'Admin session required.'));
  }

  return null;
};
