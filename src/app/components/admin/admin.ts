import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Angular Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';

// Services
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

// Models
import { Book } from '../../models/book.model';

// Pipes
import { TranslateTitlePipe } from '../../pipes/translate-title.pipe';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockBooks: number;
  recentOrders: number;
}

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TranslateModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    TranslateTitlePipe
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {
  
  // Signals para estado reativo
  loading = signal(false);
  books = signal<Book[]>([]);
  users = signal<User[]>([]);
  stats = signal<DashboardStats>({
    totalBooks: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockBooks: 0,
    recentOrders: 0
  });

  // Formulários
  bookForm!: FormGroup;
  editingBook = signal<Book | null>(null);

  // Configurações da tabela
  bookColumns: string[] = ['imagemUrl', 'titulo', 'autor', 'categoria', 'preco', 'estoque', 'disponivel', 'actions'];
  userColumns: string[] = ['name', 'email', 'role', 'createdAt', 'lastLogin', 'actions'];

  // Categorias disponíveis
  categories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private booksService: BookService,
    private authService: AuthService,
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private confirmDialog: ConfirmDialogService,
    private translate: TranslateService
  ) {
    this.initializeBookForm();
  }

  ngOnInit(): void {
    this.initializeCategories();
    this.loadDashboardData();
    this.loadBooks();
    this.loadUsers();
  }

  // Inicializar categorias traduzidas
  private initializeCategories(): void {
    this.categories = [
      this.translate.instant('ADMIN.CATEGORY_FICTION'),
      this.translate.instant('ADMIN.CATEGORY_ROMANCE'),
      this.translate.instant('ADMIN.CATEGORY_MYSTERY'),
      this.translate.instant('ADMIN.CATEGORY_FANTASY'),
      this.translate.instant('ADMIN.CATEGORY_BIOGRAPHY'),
      this.translate.instant('ADMIN.CATEGORY_HISTORY'),
      this.translate.instant('ADMIN.CATEGORY_SCIENCE'),
      this.translate.instant('ADMIN.CATEGORY_TECHNOLOGY'),
      this.translate.instant('ADMIN.CATEGORY_SELF_HELP'),
      this.translate.instant('ADMIN.CATEGORY_BUSINESS'),
      this.translate.instant('ADMIN.CATEGORY_CHILDREN'),
      this.translate.instant('ADMIN.CATEGORY_YOUNG_ADULT')
    ];
  }

  // Inicializar formulário de livro
  private initializeBookForm(): void {
    this.bookForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      autor: ['', [Validators.required, Validators.minLength(2)]],
      preco: ['', [Validators.required, Validators.min(0.01)]],
      categoria: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      imagemUrl: ['', Validators.required],
      isbn: ['', [Validators.required, Validators.pattern(/^\d{10}(\d{3})?$/)]],
      editora: ['', Validators.required],
      anoPublicacao: ['', [Validators.required, Validators.min(1000), Validators.max(new Date().getFullYear())]],
      numeroPaginas: ['', [Validators.required, Validators.min(1)]],
      estoque: ['', [Validators.required, Validators.min(0)]],
      disponivel: [true]
    });
  }

  // Carregar dados do dashboard
  loadDashboardData(): void {
    this.loading.set(true);
    
    // Carregar estatísticas reais
    this.userService.getUserStats().subscribe({
      next: (userStats) => {
        // Combinar com estatísticas de livros
        this.booksService.getBooks().subscribe({
          next: (books) => {
            const lowStockBooks = books.filter(book => book.estoque < 5).length;
            
            this.stats.set({
              totalBooks: books.length,
              totalUsers: userStats.totalUsers,
              totalOrders: 0, // TODO: Implementar quando houver serviço de pedidos
              totalRevenue: 0, // TODO: Implementar quando houver serviço de pedidos
              lowStockBooks: lowStockBooks,
              recentOrders: userStats.newUsersThisMonth
            });
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Erro ao carregar estatísticas de livros:', error);
            this.loading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas de usuários:', error);
        this.showMessage(this.translate.instant('ADMIN.ERROR_LOAD_STATS'));
        this.loading.set(false);
      }
    });
  }

  // Carregar livros
  loadBooks(): void {
    this.loading.set(true);
    this.booksService.getBooks().subscribe({
      next: (books: Book[]) => {
        this.books.set(books);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Erro ao carregar livros:', error);
        this.showMessage(this.translate.instant('ADMIN.ERROR_LOAD_BOOKS'));
        this.loading.set(false);
      }
    });
  }

  // Carregar usuários
  private loadUsers(): void {
    this.loading.set(true);
    
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.showMessage(this.translate.instant('ADMIN.ERROR_LOAD_USERS'));
        this.loading.set(false);
      }
    });
  }

  // Adicionar/Editar livro
  onSubmitBook(): void {
    if (this.bookForm.valid) {
      this.loading.set(true);
      const bookData = this.bookForm.value;
      
      if (this.editingBook()) {
        // Editar livro existente
        this.booksService.updateBook(this.editingBook()!._id!, bookData).subscribe({
          next: () => {
            this.showMessage(this.translate.instant('ADMIN.BOOK_UPDATED_SUCCESS'));
            this.resetBookForm();
            this.loadBooks();
          },
          error: (error: any) => {
            console.error('Erro ao atualizar livro:', error);
            this.showMessage(this.translate.instant('ADMIN.ERROR_UPDATE_BOOK'));
            this.loading.set(false);
          }
        });
      } else {
        // Adicionar novo livro
        this.booksService.createBook(bookData).subscribe({
          next: () => {
            this.showMessage(this.translate.instant('ADMIN.BOOK_ADDED_SUCCESS'));
            this.resetBookForm();
            this.loadBooks();
          },
          error: (error: any) => {
            console.error('Erro ao adicionar livro:', error);
            this.showMessage(this.translate.instant('ADMIN.ERROR_ADD_BOOK'));
            this.loading.set(false);
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.bookForm);
    }
  }

  // Editar livro
  editBook(book: Book): void {
    this.editingBook.set(book);
    this.bookForm.patchValue(book);
  }

  // Deletar livro
  deleteBook(book: Book): void {
    this.confirmDialog.confirmDelete(book.titulo).subscribe(confirmed => {
      if (confirmed) {
        this.loading.set(true);
        this.booksService.deleteBook(book._id!).subscribe({
          next: () => {
            this.showMessage(this.translate.instant('ADMIN.BOOK_DELETED_SUCCESS'));
            this.loadBooks();
          },
          error: (error: any) => {
            console.error('Erro ao deletar livro:', error);
            this.showMessage(this.translate.instant('ADMIN.ERROR_DELETE_BOOK'));
            this.loading.set(false);
          }
        });
      }
    });
  }

  // Reset do formulário
  resetBookForm(): void {
    this.bookForm.reset();
    this.bookForm.patchValue({ disponivel: true });
    this.editingBook.set(null);
    this.loading.set(false);
  }

  // Marcar todos os campos como tocados
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Obter mensagem de erro
  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    
    if (field?.hasError('required')) {
      return this.translate.instant('ADMIN.ERROR_REQUIRED');
    }
    
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      return this.translate.instant('ADMIN.ERROR_MIN_LENGTH', { length: requiredLength });
    }
    
    if (field?.hasError('min')) {
      const min = field.errors?.['min']?.min;
      return this.translate.instant('ADMIN.ERROR_MIN_VALUE', { value: min });
    }
    
    if (field?.hasError('max')) {
      const max = field.errors?.['max']?.max;
      return this.translate.instant('ADMIN.ERROR_MAX_VALUE', { value: max });
    }
    
    if (field?.hasError('pattern')) {
      return this.translate.instant('ADMIN.ERROR_INVALID_FORMAT');
    }
    
    return '';
  }

  // Formatar preço
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  // Formatar data
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  // Mostrar mensagem
  private showMessage(message: string): void {
    this.snackBar.open(message, this.translate.instant('ADMIN.CLOSE'), {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  // Upload de imagem (simulado)
  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Simular upload
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bookForm.patchValue({
          imagemUrl: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Alternar disponibilidade do livro
  toggleBookAvailability(book: Book): void {
    this.confirmDialog.confirmToggleBookAvailability(book.titulo, book.disponivel).subscribe(confirmed => {
      if (confirmed) {
        const updatedBook = { ...book, disponivel: !book.disponivel };
        this.booksService.updateBook(book._id!, updatedBook).subscribe({
          next: () => {
            const messageKey = updatedBook.disponivel ? 'ADMIN.BOOK_ACTIVATED_SUCCESS' : 'ADMIN.BOOK_DEACTIVATED_SUCCESS';
            this.showMessage(this.translate.instant(messageKey));
            this.loadBooks();
          },
          error: (error: any) => {
            console.error('Erro ao atualizar disponibilidade:', error);
            this.showMessage(this.translate.instant('ADMIN.ERROR_UPDATE_AVAILABILITY'));
          }
        });
      }
    });
  }

  // Gerenciar usuário (simulado)
  manageUser(user: User, action: 'activate' | 'deactivate' | 'promote' | 'demote'): void {
    const isCurrentlyActive = action === 'deactivate' || action === 'demote';
    this.confirmDialog.confirmToggleUserStatus(user.name, isCurrentlyActive).subscribe(confirmed => {
      if (confirmed) {
        let messageKey = '';
        
        switch (action) {
          case 'activate':
            messageKey = 'ADMIN.USER_ACTIVATED_SUCCESS';
            break;
          case 'deactivate':
            messageKey = 'ADMIN.USER_DEACTIVATED_SUCCESS';
            break;
          case 'promote':
            messageKey = 'ADMIN.USER_PROMOTED_SUCCESS';
            break;
          case 'demote':
            messageKey = 'ADMIN.USER_DEMOTED_SUCCESS';
            break;
        }
        
        this.showMessage(this.translate.instant(messageKey, { name: user.name }));
      }
    });
  }
}