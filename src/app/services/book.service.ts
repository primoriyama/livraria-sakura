import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { Book, CreateBookRequest, UpdateBookRequest } from '../models/book.model';

interface BooksResponse {
  books: Book[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly API_URL = 'http://localhost:3000/api/books';

  // Signal para cache dos livros
  private _books = signal<Book[]>([]);
  public books = this._books.asReadonly();

  constructor(private http: HttpClient) {}

  getBooks(filters?: any): Observable<Book[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });
    }
    
    return this.http.get<any>(this.API_URL, { params }).pipe(
      map(response => {
        // Se a resposta tem a propriedade 'books', extrair o array
        if (response && response.books) {
          const books = response.books;
          this._books.set(books);
          return books;
        }
        // Se a resposta é diretamente um array
        else if (Array.isArray(response)) {
          this._books.set(response);
          return response;
        }
        // Caso inesperado, retornar array vazio
        else {
          console.warn('Resposta inesperada da API:', response);
          this._books.set([]);
          return [];
        }
      }),
      catchError(error => {
        console.error('Erro ao buscar livros:', error);
        this._books.set([]);
        return of([]);
      })
    );
  }

  // Buscar livros com paginação
  getBooksWithPagination(page: number = 1, limit: number = 12): Observable<BooksResponse> {
    return this.http.get<BooksResponse>(this.API_URL, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Buscar livro por ID
  getBookById(id: string): Observable<Book> {
    return this.http.get<{book: Book}>(`${this.API_URL}/${id}`)
      .pipe(
        map(response => response.book)
      );
  }

  // Criar novo livro (apenas admin)
  createBook(bookData: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(this.API_URL, bookData)
      .pipe(
        tap(newBook => {
          const currentBooks = this._books();
          this._books.set([...currentBooks, newBook]);
        })
      );
  }

  // Atualizar livro (apenas admin)
  updateBook(id: string, bookData: Partial<UpdateBookRequest>): Observable<Book> {
    return this.http.patch<Book>(`${this.API_URL}/${id}`, bookData)
      .pipe(
        tap(updatedBook => {
          const currentBooks = this._books();
          const updatedBooks = currentBooks.map(book => 
            book._id === id ? updatedBook : book
          );
          this._books.set(updatedBooks);
        })
      );
  }

  // Deletar livro (apenas admin)
  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => {
          const currentBooks = this._books();
          const filteredBooks = currentBooks.filter(book => book._id !== id);
          this._books.set(filteredBooks);
        })
      );
  }

  // Upload de imagem (método antigo - manter para compatibilidade)
  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<{ imageUrl: string }>(`${this.API_URL}/upload`, formData);
  }

  // Upload de imagem para livro específico (usa endpoint correto do backend)
  uploadImageToBook(bookId: string, file: File): Observable<{ imagemUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<{ imagemUrl: string }>(`${this.API_URL}/${bookId}/upload-image`, formData);
  }

  // Buscar livros por categoria
  getBooksByCategory(category: string): Observable<Book[]> {
    return this.http.get<BooksResponse>(this.API_URL, {
      params: { categoria: category }
    }).pipe(
      map(response => response.books)
    );
  }

  // Buscar livros por termo de pesquisa
  searchBooks(searchTerm: string): Observable<Book[]> {
    return this.http.get<BooksResponse>(this.API_URL, {
      params: { search: searchTerm }
    }).pipe(
      map(response => response.books)
    );
  }

  // Obter livros em destaque
  getFeaturedBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.API_URL}/featured`);
  }

  // Obter livros mais vendidos
  getBestSellers(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.API_URL}/bestsellers`);
  }

  // Limpar cache
  clearCache(): void {
    this._books.set([]);
  }

  // Atualizar cache local
  updateLocalBook(book: Book): void {
    const currentBooks = this._books();
    const updatedBooks = currentBooks.map(b => 
      b._id === book._id ? book : b
    );
    this._books.set(updatedBooks);
  }

  // Remover livro do cache local
  removeLocalBook(bookId: string): void {
    const currentBooks = this._books();
    const filteredBooks = currentBooks.filter(book => book._id !== bookId);
    this._books.set(filteredBooks);
  }
}