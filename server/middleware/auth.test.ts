import { describe, it, expect, vi, afterEach } from 'vitest';
import { generateToken, AdminPayload } from './auth';
import jwt from 'jsonwebtoken';

vi.mock('jsonwebtoken', () => {
  return {
    default: {
      sign: vi.fn(),
      verify: vi.fn(),
      decode: vi.fn()
    }
  };
});

describe('generateToken', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call jwt.sign with correct parameters and return the token', () => {
    const admin: AdminPayload = { id: 1, username: 'admin' };
    const mockToken = 'mock.jwt.token';

    vi.mocked(jwt.sign).mockReturnValue(mockToken as any);

    const token = generateToken(admin);

    expect(token).toBe(mockToken);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledWith(
      admin,
      expect.any(String),
      { expiresIn: '24h' }
    );
  });
});
