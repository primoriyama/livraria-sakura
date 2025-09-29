import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BookService } from '../../../services/book.service';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './book-form.html',
  styleUrls: ['./book-form.scss']
})
export class BookFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private booksService = inject(BookService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(false);
  uploading = signal(false);
  isEditMode = signal(false);
  bookId = signal<string | null>(null);

  bookForm!: FormGroup;

  categories: string[] = [];

  ngOnInit(): void {
    this.initializeForm();
    this.initializeCategories();
    this.checkEditMode();
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.bookId.set(id);
      this.loadBookData(id);
    }
  }

  private loadBookData(id: string): void {
    this.loading.set(true);
    this.booksService.getBookById(id).subscribe({
      next: (book) => {
        this.populateForm(book);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar livro:', error);
        this.showMessage('BOOK_FORM.ERROR_LOADING_BOOK', 'error');
        this.loading.set(false);
      }
    });
  }

  private initializeForm(): void {
    this.bookForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      autor: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      categoria: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      isbn: ['', [Validators.required, Validators.pattern(/^\d{10}(\d{3})?$/)]],
      editora: ['', [Validators.required, Validators.maxLength(100)]],
      anoPublicacao: ['', [
        Validators.required,
        Validators.min(1000),
        Validators.max(new Date().getFullYear())
      ]],
      numeroPaginas: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      idioma: ['Português'],
      preco: ['', [Validators.required, Validators.min(0.01), Validators.max(9999.99)]],
      estoque: ['', [Validators.required, Validators.min(0), Validators.max(99999)]],
      disponivel: [true],
      promocaoAtivo: [false],
      promocaoDesconto: [0, [Validators.min(0), Validators.max(90)]],
      destaque: [false],
      imagemUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)|assets\/.+\.(jpg|jpeg|png|webp|gif|svg)|data:image\/.+;base64,.+)$/i)]]
    });
  }

  private initializeCategories(): void {
    this.categories = [
      'Romance', 'Ficção Científica', 'Fantasia', 'Mistério', 'Thriller',
      'Terror', 'Aventura', 'Drama', 'Comédia', 'Biografia', 'História',
      'Ciência', 'Tecnologia', 'Filosofia', 'Psicologia', 'Autoajuda',
      'Negócios', 'Culinária', 'Arte', 'Música', 'Esportes', 'Viagem',
      'Religião', 'Educação', 'Infantil', 'Jovem Adulto', 'Poesia',
      'Teatro', 'Ensaio', 'Crônica'
    ];
  }

  private populateForm(book: Book): void {
    this.bookForm.patchValue({
      titulo: book.titulo,
      autor: book.autor,
      categoria: book.categoria,
      descricao: book.descricao,
      isbn: book.isbn,
      editora: book.editora,
      anoPublicacao: book.anoPublicacao,
      numeroPaginas: book.numeroPaginas,
      idioma: book.idioma || 'Português',
      preco: book.preco,
      estoque: book.estoque,
      disponivel: book.disponivel,
      promocaoAtivo: book.promocao?.ativo || false,
      promocaoDesconto: book.promocao?.desconto || 0,
      destaque: book.destaque || false,
      imagemUrl: book.imagemUrl
    });
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.loading.set(true);
      const bookData = this.prepareBookData();

      if (this.isEditMode()) {
        this.updateBook(bookData);
      } else {
        this.createBook(bookData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private prepareBookData(): any {
    const formValue = this.bookForm.value;

    return {
      titulo: formValue.titulo?.trim(),
      autor: formValue.autor?.trim(),
      categoria: formValue.categoria,
      descricao: formValue.descricao?.trim(),
      isbn: formValue.isbn?.replace(/\D/g, ''),
      editora: formValue.editora?.trim(),
      anoPublicacao: parseInt(formValue.anoPublicacao),
      numeroPaginas: parseInt(formValue.numeroPaginas),
      idioma: formValue.idioma || 'Português',
      preco: parseFloat(formValue.preco),
      estoque: parseInt(formValue.estoque),
      disponivel: formValue.disponivel,
      promocao: {
        ativo: formValue.promocaoAtivo,
        desconto: formValue.promocaoAtivo ? parseFloat(formValue.promocaoDesconto) : 0
      },
      destaque: formValue.destaque,
      imagemUrl: formValue.imagemUrl?.trim()
    };
  }

  private createBook(bookData: any): void {
    this.booksService.createBook(bookData).subscribe({
      next: (response) => {
        this.showMessage('BOOK_FORM.BOOK_CREATED_SUCCESS', 'success');
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        console.error('Erro ao criar livro:', error);
        this.handleApiError(error);
        this.loading.set(false);
      }
    });
  }

  private updateBook(bookData: any): void {
    const id = this.bookId();
    if (id) {
      this.booksService.updateBook(id, bookData).subscribe({
        next: (response) => {
          this.showMessage('BOOK_FORM.BOOK_UPDATED_SUCCESS', 'success');
          this.router.navigate(['/admin']);
        },
        error: (error) => {
          console.error('Erro ao atualizar livro:', error);
          this.handleApiError(error);
          this.loading.set(false);
        }
      });
    }
  }

  private handleApiError(error: any): void {
    if (error.status === 400) {
      this.showMessage('BOOK_FORM.VALIDATION_ERROR', 'error');
    } else if (error.status === 409) {
      this.showMessage('BOOK_FORM.ISBN_ALREADY_EXISTS', 'error');
    } else {
      this.showMessage('BOOK_FORM.GENERIC_ERROR', 'error');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(messageKey: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.translate.get(messageKey).subscribe(message => {
      this.snackBar.open(message, 'X', {
        duration: type === 'error' ? 5000 : 3000,
        panelClass: [`snackbar-${type}`],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.bookForm.get(fieldName);
    if (control?.errors && control.touched) {
      const errors = control.errors;

      if (errors['required']) {
        return this.translate.instant('BOOK_FORM.FIELD_REQUIRED');
      }
      if (errors['minlength']) {
        return this.translate.instant('BOOK_FORM.MIN_LENGTH_ERROR', {
          min: errors['minlength'].requiredLength
        });
      }
      if (errors['maxlength']) {
        return this.translate.instant('BOOK_FORM.MAX_LENGTH_ERROR', {
          max: errors['maxlength'].requiredLength
        });
      }
      if (errors['min']) {
        return this.translate.instant('BOOK_FORM.MIN_VALUE_ERROR', {
          min: errors['min'].min
        });
      }
      if (errors['max']) {
        return this.translate.instant('BOOK_FORM.MAX_VALUE_ERROR', {
          max: errors['max'].max
        });
      }
      if (errors['pattern']) {
        if (fieldName === 'isbn') {
          return this.translate.instant('BOOK_FORM.INVALID_ISBN');
        }
        if (fieldName === 'imagemUrl') {
          return this.translate.instant('BOOK_FORM.INVALID_IMAGE_URL');
        }
        return this.translate.instant('BOOK_FORM.INVALID_FORMAT');
      }
    }
    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const control = this.bookForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }

  generateRandomISBN(): void {
    const isbn = this.generateISBN13();
    this.bookForm.patchValue({ isbn });
  }

  private generateISBN13(): string {
    let isbn = '978';
    for (let i = 0; i < 9; i++) {
      isbn += Math.floor(Math.random() * 10);
    }
    const checkDigit = this.calculateISBNCheckDigit(isbn);
    isbn += checkDigit;
    return isbn;
  }

  private calculateISBNCheckDigit(isbn: string): number {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  formatPriceInput(event: any): void {
    let value = event.target.value;
    value = value.replace(/[^\d.,]/g, '');
    value = value.replace(',', '.');
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    event.target.value = value;
    this.bookForm.patchValue({ preco: value });
  }

  validateImageUrl(): void {
    const url = this.bookForm.get('imagemUrl')?.value;
    if (url && url.trim()) {
      console.log('Validando URL da imagem:', url);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploading.set(true);
      setTimeout(() => {
        const fakeUrl = `https://via.placeholder.com/300x400.png?text=${encodeURIComponent(file.name)}`;
        this.bookForm.patchValue({ imagemUrl: fakeUrl });
        this.uploading.set(false);
        this.showMessage('BOOK_FORM.IMAGE_UPLOADED_SUCCESS', 'success');
      }, 2000);
    }
  }

  onImageError(): void {
    console.log('Erro ao carregar imagem');
    this.showMessage('BOOK_FORM.IMAGE_LOAD_ERROR', 'error');
  }

  onImageLoad(): void {
    console.log('Imagem carregada com sucesso');
  }

  removeImage(): void {
    this.bookForm.patchValue({ imagemUrl: '' });
    this.showMessage('BOOK_FORM.IMAGE_REMOVED', 'info');
  }

  resetForm(): void {
    if (this.isEditMode()) {
      const id = this.bookId();
      if (id) {
        this.loadBookData(id);
        this.showMessage('BOOK_FORM.FORM_RESET', 'info');
      }
    } else {
      this.bookForm.reset();
      this.initializeForm();
      this.showMessage('BOOK_FORM.FORM_RESET', 'info');
    }
  }
}
