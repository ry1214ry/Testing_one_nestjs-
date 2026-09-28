import { Role } from '../../common/enums/role.enum.js';
import { AtStrategy } from './at.strategy.js';

const configMock = { get: vi.fn() } as any;

describe('AtStrategy', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    configMock.get.mockReturnValue('at-secret');
    const strategy = new AtStrategy(configMock);
    expect(strategy).toBeDefined();
  });

  it('reads the access-token secret from the ConfigService', () => {
    configMock.get.mockReturnValue('at-secret');
    new AtStrategy(configMock);
    expect(configMock.get).toHaveBeenCalledWith('JWT_AT_SECRET');
  });

  it('validates a payload and returns a sanitized RequestUser', async () => {
    configMock.get.mockReturnValue('at-secret');
    const strategy = new AtStrategy(configMock);

    const user = await strategy.validate({
      sub: 'u1',
      username: 'john_doe',
      email: 'user@example.com',
      role: Role.ADMIN,
      iat: 123,
      exp: 456,
    });

    expect(user).toEqual({
      sub: 'u1',
      username: 'john_doe',
      email: 'user@example.com',
      role: Role.ADMIN,
    });
  });
});