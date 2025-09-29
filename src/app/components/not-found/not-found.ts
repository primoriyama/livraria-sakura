import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [
    CommonModule, 
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    TranslateModule
  ],
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.scss']
})
export class NotFoundComponent {
  
  // Sugestões de páginas populares
  suggestions = [
    { titleKey: 'NOT_FOUND.SUGGESTIONS.CATALOG', route: '/', icon: 'auto_stories' },
    { titleKey: 'NOT_FOUND.SUGGESTIONS.ABOUT', route: '/about', icon: 'info' },
    { titleKey: 'NOT_FOUND.SUGGESTIONS.ACCOUNT', route: '/login', icon: 'account_circle' },
    { titleKey: 'NOT_FOUND.SUGGESTIONS.CART', route: '/cart', icon: 'shopping_cart' }
  ];

  constructor(private translate: TranslateService) {}

  // Função para voltar na história do navegador
  goBack(): void {
    window.history.back();
  }

  // Função para reportar problema
  reportProblem(): void {
    // Aqui poderia abrir um modal ou redirecionar para suporte
    console.log('Problema reportado');
  }
}