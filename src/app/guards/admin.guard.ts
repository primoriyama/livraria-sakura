import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();

    if (isAuthenticated && isAdmin) {
      return true;
    } else if (isAuthenticated && !isAdmin) {
      return this.router.createUrlTree(['/']);
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}
