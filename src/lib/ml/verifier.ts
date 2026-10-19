// src/lib/ml/verifier.ts
// Native Web Crypto API SHA-256 cryptographic integrity verifier (§8.2, ML-03)
// Performs zero-copy buffer digest check before runtime session compilation.

export class SecurityIntegrityError extends Error {
  public computedHash: string;
  public expectedHash: string;
  public byteLength: number;

  constructor(message: string, computedHash: string, expectedHash: string, byteLength: number) {
    super(message);
    this.name = 'SecurityIntegrityError';
    this.computedHash = computedHash;
    this.expectedHash = expectedHash;
    this.byteLength = byteLength;
  }
}

export interface VerificationResult {
  verified: boolean;
  computedHash: string;
  expectedHash: string;
  byteLength: number;
}

/**
 * Verifies the cryptographic SHA-256 digest of an in-memory ArrayBuffer.
 * Rejects model execution immediately if byte alteration or tampering is detected.
 */
export async function verifyModelBuffer(
  buffer: ArrayBuffer,
  expectedSha256: string
): Promise<VerificationResult> {
  const byteLength = buffer.byteLength;

  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not supported in this runtime environment.');
  }

  // Native Web Crypto SHA-256 computation
  const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(digestBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
  const normalizedExpected = expectedSha256.toLowerCase().trim();

  const verified = computedHash === normalizedExpected;

  if (!verified) {
    throw new SecurityIntegrityError(
      `Cryptographic integrity check failed! Expected SHA-256 ${normalizedExpected}, received ${computedHash}. Execution aborted.`,
      computedHash,
      normalizedExpected,
      byteLength
    );
  }

  return {
    verified: true,
    computedHash,
    expectedHash: normalizedExpected,
    byteLength
  };
}
