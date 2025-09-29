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

/**
 * Componente para formulário de criação e edição de livros.
 * Suporta tanto criação de novos livros quanto edição de livros existentes.
 */
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
  
  // Injeção de dependências usando inject()
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private booksService = inject(BookService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  // Signals para controle de estado
  loading = signal(false);
  uploading = signal(false);
  isEditMode = signal(false);
  bookId = signal<string | null>(null);

  // Formulário reativo
  bookForm!: FormGroup;

  // Lista de categorias disponíveis
  categories: string[] = [];

  ngOnInit(): void {
    this.initializeForm();
    this.initializeCategories();
    this.checkEditMode();
  }

  /**
   * Verifica se está em modo de edição baseado na rota
   */
  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.bookId.set(id);
      this.loadBookData(id);
    }
  }

  /**
   * Carrega os dados do livro para edição
   * @param id ID do livro
   */
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

  /**
   * Inicializa o formulário com validações
   */
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
      idioma: ['Português'], // Valor padrão
      preco: ['', [Validators.required, Validators.min(0.01), Validators.max(9999.99)]],
      estoque: ['', [Validators.required, Validators.min(0), Validators.max(99999)]],
      disponivel: [true], // Padrão: disponível
      promocaoAtivo: [false], // Padrão: sem promoção
      promocaoDesconto: [0, [Validators.min(0), Validators.max(90)]], // Desconto em %
      destaque: [false], // Padrão: não é destaque
      imagemUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)|assets\/.+\.(jpg|jpeg|png|webp|gif|svg)|data:image\/.+;base64,.+)$/i)]]
    });
  }

  /**
   * Inicializa a lista de categorias
   */
  private initializeCategories(): void {
    this.categories = [
      'Romance',
      'Ficção Científica',
      'Fantasia',
      'Mistério',
      'Thriller',
      'Terror',
      'Aventura',
      'Drama',
      'Comédia',
      'Biografia',
      'História',
      'Ciência',
      'Tecnologia',
      'Filosofia',
      'Psicologia',
      'Autoajuda',
      'Negócios',
      'Culinária',
      'Arte',
      'Música',
      'Esportes',
      'Viagem',
      'Religião',
      'Educação',
      'Infantil',
      'Jovem Adulto',
      'Poesia',
      'Teatro',
      'Ensaio',
      'Crônica'
    ];
  }

  /**
   * Popula o formulário com os dados do livro
   * @param book Dados do livro
   */
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

  /**
   * Submete o formulário
   */
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

  /**
   * Prepara os dados do livro para envio
   * @returns Dados formatados do livro
   */
  private prepareBookData(): any {
    const formValue = this.bookForm.value;
    
    return {
      titulo: formValue.titulo?.trim(),
      autor: formValue.autor?.trim(),
      categoria: formValue.categoria,
      descricao: formValue.descricao?.trim(),
      isbn: formValue.isbn?.replace(/\D/g, ''), // Remove caracteres não numéricos
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

  /**
   * Cria um novo livro
   * @param bookData Dados do livro
   */
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

  /**
   * Atualiza um livro existente
   * @param bookData Dados do livro
   */
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

  /**
   * Trata erros da API
   * @param error Erro da API
   */
  private handleApiError(error: any): void {
    if (error.status === 400) {
      this.showMessage('BOOK_FORM.VALIDATION_ERROR', 'error');
    } else if (error.status === 409) {
      this.showMessage('BOOK_FORM.ISBN_ALREADY_EXISTS', 'error');
    } else {
      this.showMessage('BOOK_FORM.GENERIC_ERROR', 'error');
    }
  }

  /**
   * Marca todos os campos do formulário como tocados
   */
  private markFormGroupTouched(): void {
    Object.keys(this.bookForm.controls).forEach(key => {
      const control = this.bookForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Exibe mensagem para o usuário
   * @param messageKey Chave da mensagem para tradução
   * @param type Tipo da mensagem
   */
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

  /**
   * Cancela a operação e volta para a lista
   */
  onCancel(): void {
    this.router.navigate(['/admin']);
  }

  /**
   * Obtém mensagem de erro para um campo específico
   * @param fieldName Nome do campo
   * @returns Mensagem de erro traduzida
   */
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

  /**
   * Verifica se um campo tem erro
   * @param fieldName Nome do campo
   * @returns True se o campo tem erro
   */
  hasFieldError(fieldName: string): boolean {
    const control = this.bookForm.get(fieldName);
    return !!(control?.errors && control.touched);
  }

  /**
   * Gera um ISBN aleatório para teste
   */
  generateRandomISBN(): void {
    const isbn = this.generateISBN13();
    this.bookForm.patchValue({ isbn });
  }

  /**
   * Gera um ISBN-13 válido
   * @returns ISBN-13 gerado
   */
  private generateISBN13(): string {
    // Prefixo 978 (padrão para livros)
    let isbn = '978';
    
    // 9 dígitos aleatórios
    for (let i = 0; i < 9; i++) {
      isbn += Math.floor(Math.random() * 10);
    }
    
    // Calcula o dígito verificador
    const checkDigit = this.calculateISBNCheckDigit(isbn);
    isbn += checkDigit;
    
    return isbn;
  }

  /**
   * Calcula o dígito verificador do ISBN-13
   * @param isbn ISBN sem o dígito verificador
   * @returns Dígito verificador
   */
  private calculateISBNCheckDigit(isbn: string): number {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  /**
   * Formata a entrada de preço
   * @param event Evento de input
   */
  formatPriceInput(event: any): void {
    let value = event.target.value;
    
    // Remove caracteres não numéricos exceto ponto e vírgula
    value = value.replace(/[^\d.,]/g, '');
    
    // Substitui vírgula por ponto
    value = value.replace(',', '.');
    
    // Garante apenas um ponto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limita a 2 casas decimais
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    event.target.value = value;
    this.bookForm.patchValue({ preco: value });
  }

  /**
   * Valida URL da imagem
   */
  validateImageUrl(): void {
    const url = this.bookForm.get('imagemUrl')?.value;
    if (url && url.trim()) {
      // Aqui você pode adicionar validação adicional se necessário
      console.log('Validando URL da imagem:', url);
    }
  }

  /**
   * Manipula seleção de arquivo
   * @param event Evento de seleção de arquivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploading.set(true);
      
      // Simula upload (substitua pela implementação real)
      setTimeout(() => {
        const fakeUrl = `https://via.placeholder.com/300x400.png?text=${encodeURIComponent(file.name)}`;
        this.bookForm.patchValue({ imagemUrl: fakeUrl });
        this.uploading.set(false);
        this.showMessage('BOOK_FORM.IMAGE_UPLOADED_SUCCESS', 'success');
      }, 2000);
    }
  }

  /**
   * Manipula erro de carregamento da imagem
   */
  onImageError(): void {
    console.log('Erro ao carregar imagem');
    this.showMessage('BOOK_FORM.IMAGE_LOAD_ERROR', 'error');
  }

  /**
   * Manipula carregamento bem-sucedido da imagem
   */
  onImageLoad(): void {
    console.log('Imagem carregada com sucesso');
  }

  /**
   * Remove a imagem selecionada
   */
  removeImage(): void {
    this.bookForm.patchValue({ imagemUrl: '' });
    this.showMessage('BOOK_FORM.IMAGE_REMOVED', 'info');
  }

  /**
   * Reseta o formulário para os valores originais
   */
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