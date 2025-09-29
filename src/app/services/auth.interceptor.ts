import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);
  const token = authService.getToken();

  if (token && req.url.includes('/api/')) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && error.error?.code === 'INVALID_TOKEN') {
          snackBar.open(
            'Sua sessão expirou. Faça login novamente.',
            'Fechar',
            {
              duration: 5000,
              panelClass: ['error-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            }
          );
          return EMPTY;
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
