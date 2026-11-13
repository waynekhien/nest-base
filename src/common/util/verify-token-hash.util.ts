import { timingSafeEqual } from 'node:crypto';
import { hashToken } from './hash-token.util.js';

export function verifyTokenHash(token: string, expectedHash: string): boolean {
  const actualBuffer = Buffer.from(hashToken(token), 'utf8');
  const expectedBuffer = Buffer.from(expectedHash, 'utf8');

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}
