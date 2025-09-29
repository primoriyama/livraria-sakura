import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { Book } from '../../models/book.model';
import { TranslateTitlePipe } from '../../pipes/translate-title.pipe';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-book-details',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    TranslateModule,
    TranslateTitlePipe
  ],
  templateUrl: './book-details.html',
  styleUrl: './book-details.scss'
})
export class BookDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private translate = inject(TranslateService);
  private confirmDialog = inject(ConfirmDialogService);

  book = signal<Book | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBook(bookId);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadBook(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book.set(book);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar livro:', err);
        this.error.set(this.translate.instant('BOOK_DETAILS.ERROR_LOAD_BOOK'));
        this.loading.set(false);
      }
    });
  }



  addToCart(): void {
    const currentBook = this.book();
    if (currentBook && this.isAvailable()) {
      this.cartService.addToCart(currentBook);
    }
  }

  removeFromCart(): void {
    const currentBook = this.book();
    if (currentBook && currentBook._id) {
      this.confirmDialog.confirmRemoveFromCart(currentBook.titulo).subscribe(confirmed => {
        if (confirmed) {
          this.cartService.removeFromCart(currentBook._id!);
        }
      });
    }
  }

  isAvailable(): boolean {
    const currentBook = this.book();
    return currentBook ? currentBook.estoque > 0 : false;
  }

  isInCart(): boolean {
    const currentBook = this.book();
    return currentBook?._id ? this.cartService.isInCart(currentBook._id) : false;
  }

  getItemQuantity(): number {
    const currentBook = this.book();
    return currentBook?._id ? this.cartService.getItemQuantity(currentBook._id) : 0;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }
}