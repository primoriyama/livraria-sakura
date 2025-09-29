import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Book } from '../../models/book.model';
import { TranslateTitlePipe } from '../../pipes/translate-title.pipe';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    TranslateTitlePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  private static hasLoggedTitle = false;

  private bookService = inject(BookService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private confirmDialog = inject(ConfirmDialogService);

  private _books = signal<Book[]>([]);
  private _loading = signal(true);
  private _searchTerm = signal('');
  private _selectedCategory = signal('');

  books = this._books.asReadonly();
  loading = this._loading.asReadonly();
  searchTerm = this._searchTerm.asReadonly();
  selectedCategory = this._selectedCategory.asReadonly();

  filteredBooks = computed(() => {
    const books = this._books() || [];
    const search = this._searchTerm().toLowerCase();
    const category = this._selectedCategory();

    if (!search && !category) {
      return books;
    }

    return books.filter(book => {
      const translatedTitle = this.getTranslatedTitle(book.titulo).toLowerCase();
      const matchesSearch = !search || 
        translatedTitle.includes(search) ||
        (book.autor?.toLowerCase().includes(search) ?? false);
      
      const matchesCategory = !category || book.categoria === category;
      
      return matchesSearch && matchesCategory;
    });
  });

  categories = computed(() => {
    const books = this._books() || [];
    const categorySet = new Set(books.map(book => book.categoria));
    return Array.from(categorySet).sort();
  });

  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;

  constructor() {
    HomeComponent.hasLoggedTitle = false;
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this._loading.set(true);
    this.bookService.getBooks().subscribe({
      next: (books: Book[]) => {
        this._books.set(books || []);
        this._loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar livros:', error);
        this.snackBar.open(
          this.translate.instant('HOME.ERROR_LOAD_BOOKS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
        this._loading.set(false);
      }
    });
  }

  updateSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  updateCategory(category: string): void {
    this._selectedCategory.set(category);
  }

  clearFilters(): void {
    this._searchTerm.set('');
    this._selectedCategory.set('');
  }

  addToCart(book: Book): void {
    this.cartService.addToCart(book);
  }

  isInCart(bookId: string | undefined): boolean {
    if (!bookId) return false;
    return this.cartService.isInCart(bookId);
  }

  getCartQuantity(bookId: string | undefined): number {
    if (!bookId) return 0;
    return this.cartService.getItemQuantity(bookId);
  }

  removeFromCart(book: Book): void {
    if(!book._id) return;
    const translatedTitle = this.getTranslatedTitle(book.titulo);
    this.confirmDialog.confirmRemoveFromCart(translatedTitle).subscribe(confirmed => {
      if (confirmed) {
        this.cartService.removeFromCart(book._id!);
        this.snackBar.open(
          this.translate.instant('HOME.BOOK_REMOVED_FROM_CART', { title: translatedTitle }), 
          this.translate.instant('COMMON.CLOSE'), 
          { 
            duration: 2000,
            panelClass: ['info-snackbar']
          }
        );
      }
    });
  }

  deleteBook(book: Book): void {
    const translatedTitle = this.getTranslatedTitle(book.titulo);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.translate.instant('COMMON.DELETE'),
        message: this.translate.instant('HOME.CONFIRM_DELETE_BOOK', { title: translatedTitle })
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        if (!book._id) return;
        this.bookService.deleteBook(book._id).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('HOME.BOOK_DELETED_SUCCESS'), 
              this.translate.instant('COMMON.CLOSE'), 
              { 
                duration: 3000,
                panelClass: ['success-snackbar']
              }
            );
            this.loadBooks();
          },
          error: (error) => {
            console.error('Erro ao deletar livro:', error);
            this.snackBar.open(
              this.translate.instant('HOME.ERROR_DELETE_BOOK'), 
              this.translate.instant('COMMON.CLOSE'), 
              { 
                duration: 3000,
                panelClass: ['error-snackbar']
              }
            );
          }
        });
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  isAvailable(book: Book): boolean {
    return book.estoque > 0;
  }

  public getTranslatedTitle(title: string): string {
    if (!title) return '';

    if (!HomeComponent.hasLoggedTitle) {
      console.log('--- DEPURAÇÃO DE TÍTULO ---');
      console.log('Título vindo do Banco de Dados (book.titulo):', `'${title}'`);
      console.log('Chave de tradução que estamos procurando:', `'BOOK_TITLES.${title}'`);
      HomeComponent.hasLoggedTitle = true;
    }
    
    const key = 'BOOK_TITLES.' + title;
    const translation = this.translate.instant(key);
    
    return translation === key ? title : translation;
  }

  onImageError(event: any): void {
    // Substituir imagem quebrada por um ícone de livro
    const img = event.target;
    const parent = img.parentElement;
    
    // Remover a imagem quebrada
    img.remove();
    
    // Criar div com ícone de livro
    const noImageDiv = document.createElement('div');
    noImageDiv.className = 'no-image';
    noImageDiv.innerHTML = '<mat-icon>book</mat-icon>';
    
    parent.appendChild(noImageDiv);
  }
}
