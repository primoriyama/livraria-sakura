import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/book.model';
import { AuthService } from '../../services/auth.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { TranslateTitlePipe } from '../../pipes/translate-title.pipe';


@Component({
  selector: 'app-cart',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTooltipModule,
    TranslateModule,
    TranslateTitlePipe
  ],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class CartComponent {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private confirmDialog = inject(ConfirmDialogService);
  private translate = inject(TranslateService);

  cartItems = this.cartService.cartItems;
  totalItems = this.cartService.itemCount;
  totalPrice = this.cartService.total;

  loading = signal(false);

  isEmpty = computed(() => this.cartItems().length === 0);

  shipping = computed(() => {
    const total = this.totalPrice();
    return total >= 100 ? 0 : 15.90;
  });

  finalTotal = computed(() => this.totalPrice() + this.shipping());

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(item);
      return;
    }

    if (newQuantity > item.book.estoque) {
      this.snackBar.open(
        this.translate.instant('CART.MESSAGES.STOCK_LIMIT', { stock: item.book.estoque }),
        this.translate.instant('CART.MESSAGES.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    if (item.book._id) {
      this.cartService.updateQuantity(item.book._id, newQuantity);
      this.snackBar.open(
        this.translate.instant('CART.MESSAGES.QUANTITY_UPDATED'),
        this.translate.instant('CART.MESSAGES.CLOSE'),
        { duration: 2000 }
      );
    }
  }

  removeItem(item: CartItem): void {
    this.confirmDialog.confirmRemoveFromCart(item.book.titulo).subscribe(confirmed => {
      if (confirmed && item.book._id) {
        this.cartService.removeFromCart(item.book._id);
        this.snackBar.open(
          this.translate.instant('CART.MESSAGES.ITEM_REMOVED'),
          this.translate.instant('CART.MESSAGES.UNDO'),
          { duration: 3000 }
        ).onAction().subscribe(() => {
          this.cartService.addToCart(item.book, item.quantity);
        });
      }
    });
  }

  clearCart(): void {
    this.confirmDialog.confirmClearCart().subscribe(confirmed => {
      if (confirmed) {
        this.cartService.clearCart();
        this.snackBar.open(
          this.translate.instant('CART.MESSAGES.CART_CLEARED'),
          this.translate.instant('CART.MESSAGES.CLOSE'),
          { duration: 2000 }
        );
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open(
        this.translate.instant('CART.MESSAGES.LOGIN_REQUIRED'),
        this.translate.instant('CART.MESSAGES.LOGIN'),
        { duration: 4000 }
      ).onAction().subscribe(() => {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: '/checkout' }
        });
      });
      return;
    }

    if (this.isEmpty()) {
      this.snackBar.open(
        this.translate.instant('CART.MESSAGES.ADD_ITEMS_FIRST'),
        this.translate.instant('CART.MESSAGES.CLOSE'),
        { duration: 3000 }
      );
      return;
    }

    const unavailableItems = this.cartItems().filter(item =>
      item.quantity > item.book.estoque
    );

    if (unavailableItems.length > 0) {
      this.snackBar.open(
        this.translate.instant('CART.MESSAGES.ITEMS_UNAVAILABLE'),
        this.translate.instant('CART.MESSAGES.CLOSE'),
        { duration: 4000 }
      );
      return;
    }

    this.router.navigate(['/checkout']);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  getItemSubtotal(item: CartItem): number {
    return item.book.preco * item.quantity;
  }
}
