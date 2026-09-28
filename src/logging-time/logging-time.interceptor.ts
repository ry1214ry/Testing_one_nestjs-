import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Logger } from '@nestjs/common';

@Injectable()
export class LoggingTimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger('PERFORMANCE');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now(); // ⏱️ Start timer

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime; // 🕒 Calculate time taken
        this.logger.log(`⚡ [${method}] ${url} took ${duration}ms to complete`);
      }),
    );
  }
}
