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

  // Signals do AuthService
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;

  // Signals do CartService
  cartItemCount = this.cartService.itemCount;

  // Idiomas disponíveis
  languages = [
    { code: 'pt', name: 'Português' },
    { code: 'en', name: 'English' }
  ];

  currentLanguage = 'pt';

  constructor() {
    // Configurar idioma inicial
    const savedLanguage = localStorage.getItem('language') || 'pt';
    this.currentLanguage = savedLanguage;
    
    // Definir idioma padrão e usar o idioma salvo
    this.translate.setDefaultLang('pt');
    this.translate.use(savedLanguage);

    // Debug temporário
    console.log('Header: cartItemCount inicial:', this.cartItemCount());
    
    // Effect para debug
    effect(() => {
      console.log('Header: cartItemCount mudou para:', this.cartItemCount());
    });
  }

  // Alternar idioma
  changeLanguage(language: string): void {
    this.currentLanguage = language;
    this.translate.use(language);
    localStorage.setItem('language', language);
  }

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Navegar para o carrinho
  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  // Navegar para o perfil
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Navegar para admin
  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
