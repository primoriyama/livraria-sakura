import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;

  cartItemCount = this.cartService.itemCount;

  languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' }
  ];

  currentLanguage = 'pt';

  constructor() {
    const savedLanguage = localStorage.getItem('language') || 'pt';
    this.currentLanguage = savedLanguage;

    this.translate.setDefaultLang('pt');
    this.translate.use(savedLanguage);

    console.log('Header: cartItemCount inicial:', this.cartItemCount());

    effect(() => {
      console.log('Header: cartItemCount mudou para:', this.cartItemCount());
    });
  }

  changeLanguage(language: string): void {
    this.currentLanguage = language;
    this.translate.use(language);
    localStorage.setItem('language', language);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
