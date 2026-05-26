import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { unlink } from 'fs';
import { catchError, Observable, throwError } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof BadRequestException) {
          const request = context.switchToHttp().getRequest<Request>();
          const file = request.file;

          if (file) {
            unlink(file.path, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error removing file:', unlinkErr);
              }
            });
          }
        }
        return throwError(() => err as Error);
      }),
    );
  }
}
