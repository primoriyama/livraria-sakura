import { Injectable, signal, computed, effect } from '@angular/core';
import { Book, CartItem, Cart } from '../models/book.model';

/**
 * Serviço responsável por gerenciar o carrinho de compras.
 * Utiliza Angular Signals para reatividade e localStorage para persistência.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'sakura_cart';

  // Signal para os itens do carrinho
  private _cartItems = signal<CartItem[]>([]);

  // Computed signals para valores derivados
  public cartItems = this._cartItems.asReadonly();

  // Computed para contar total de itens no carrinho
  public itemCount = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  // Computed para calcular valor total do carrinho
  public total = computed(() => {
    return this._cartItems().reduce((total, item) => {
      return total + (item.book.preco * item.quantity);
    }, 0);
  });

  // Computed que retorna o carrinho completo
  public cart = computed<Cart>(() => ({
    items: this._cartItems(),
    total: this.total(),
    itemCount: this.itemCount()
  }));

  // Computed para verificar se o carrinho está vazio
  public isEmpty = computed(() => this._cartItems().length === 0);

  constructor() {
    // Effect para persistir no localStorage sempre que o carrinho mudar
    effect(() => {
      const items = this._cartItems();
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    });

    // Carregar dados do localStorage na inicialização
    this.loadFromStorage();
  }

  /**
   * Carrega os dados do carrinho salvos no localStorage
   */
  private loadFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(this.CART_KEY);
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        this._cartItems.set(cartData);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
      this._cartItems.set([]);
    }
  }

  /**
   * Adiciona um livro ao carrinho
   * @param book Livro a ser adicionado
   * @param quantity Quantidade a ser adicionada (padrão: 1)
   */
  addToCart(book: Book, quantity: number = 1): void {
    const currentItems = this._cartItems();
    const existingItemIndex = currentItems.findIndex(item => item.book._id === book._id);

    if (existingItemIndex >= 0) {
      // Se o item já existe, atualiza a quantidade
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      this._cartItems.set(updatedItems);
    } else {
      // Se é um novo item, adiciona ao carrinho
      const newItem: CartItem = { book, quantity };
      this._cartItems.set([...currentItems, newItem]);
    }
  }

  /**
   * Remove um livro completamente do carrinho
   * @param bookId ID do livro a ser removido
   */
  removeFromCart(bookId: string): void {
    const currentItems = this._cartItems();
    const updatedItems = currentItems.filter(item => item.book._id !== bookId);
    this._cartItems.set(updatedItems);
  }

  /**
   * Atualiza a quantidade de um item no carrinho
   * @param bookId ID do livro
   * @param quantity Nova quantidade (se <= 0, remove o item)
   */
  updateQuantity(bookId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    const currentItems = this._cartItems();
    const updatedItems = currentItems.map(item => {
      if (item.book._id === bookId) {
        return { ...item, quantity };
      }
      return item;
    });
    this._cartItems.set(updatedItems);
  }

  /**
   * Limpa todos os itens do carrinho
   */
  clearCart(): void {
    this._cartItems.set([]);
  }

  /**
   * Obtém a quantidade de um item específico no carrinho
   * @param bookId ID do livro
   * @returns Quantidade do item ou 0 se não estiver no carrinho
   */
  getItemQuantity(bookId: string): number {
    const item = this._cartItems().find(item => item.book._id === bookId);
    return item ? item.quantity : 0;
  }

  /**
   * Verifica se um livro está no carrinho
   * @param bookId ID do livro
   * @returns true se o livro estiver no carrinho
   */
  isInCart(bookId: string): boolean {
    return this._cartItems().some(item => item.book._id === bookId);
  }

  /**
   * Método para obter o carrinho como um snapshot (não reativo)
   * @returns Cópia do estado atual do carrinho
   */
  getCartSnapshot(): Cart {
    return {
      items: [...this._cartItems()],
      total: this.total(),
      itemCount: this.itemCount()
    };
  }

  /**
   * Método para calcular o total de um item específico
   * @param bookId ID do livro
   * @returns Valor total do item (preço × quantidade)
   */
  getItemTotal(bookId: string): number {
    const item = this._cartItems().find(item => item.book._id === bookId);
    return item ? item.book.preco * item.quantity : 0;
  }

  /**
   * Método para validar se todos os itens ainda estão disponíveis
   * Remove automaticamente itens que não estão mais disponíveis ou sem estoque suficiente
   * @param availableBooks Lista de livros disponíveis
   * @returns Lista de itens válidos no carrinho
   */
  validateCart(availableBooks: Book[]): CartItem[] {
    const currentItems = this._cartItems();
    const validItems = currentItems.filter(cartItem => {
      const availableBook = availableBooks.find(book => book._id === cartItem.book._id);
      return availableBook && availableBook.estoque >= cartItem.quantity;
    });

    // Se algum item foi removido, atualiza o carrinho
    if (validItems.length !== currentItems.length) {
      this._cartItems.set(validItems);
    }

    return validItems;
  }
}