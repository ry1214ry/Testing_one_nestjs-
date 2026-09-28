import { Role } from '../../common/enums/role.enum.js';
import { extractFromBody, RtStrategy } from './rt.strategy.js';

const configMock = { get: vi.fn() } as any;

describe('RtStrategy', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    configMock.get.mockReturnValue('rt-secret');
    const strategy = new RtStrategy(configMock);
    expect(strategy).toBeDefined();
  });

  it('reads the refresh-token secret from the ConfigService', () => {
    configMock.get.mockReturnValue('rt-secret');
    new RtStrategy(configMock);
    expect(configMock.get).toHaveBeenCalledWith('JWT_RT_SECRET');
  });

  it('validates a payload and returns a sanitized RequestUser', async () => {
    configMock.get.mockReturnValue('rt-secret');
    const strategy = new RtStrategy(configMock);

    const user = await strategy.validate({
      sub: 'u1',
      username: 'john_doe',
      email: 'user@example.com',
      role: Role.USER,
      iat: 123,
      exp: 456,
    });

    expect(user).toEqual({
      sub: 'u1',
      username: 'john_doe',
      email: 'user@example.com',
      role: Role.USER,
    });
  });

  describe('extractFromBody', () => {
    it('returns the refresh token from the request body', () => {
      expect(extractFromBody({ body: { refreshToken: 'rt-1' } } as any)).toBe(
        'rt-1',
      );
    });

    it('returns null when the refresh token missing or empty', () => {
      expect(extractFromBody({ body: {} } as any)).toBeNull();
      expect(
        extractFromBody({ body: { refreshToken: '' } } as any),
      ).toBeNull();
      expect(extractFromBody({ body: { refreshToken: 1 } } as any)).toBeNull();
    });
  });
});