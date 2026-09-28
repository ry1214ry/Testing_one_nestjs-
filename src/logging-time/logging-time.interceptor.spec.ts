import { LoggingTimeInterceptor } from './logging-time.interceptor.js';

describe('LoggingTimeInterceptor', () => {
  it('should be defined', () => {
    expect(new LoggingTimeInterceptor()).toBeDefined();
  });
});
