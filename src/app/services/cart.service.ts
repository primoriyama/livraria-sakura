import { Injectable, signal, computed, effect } from '@angular/core';
import { Book, CartItem, Cart } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'sakura_cart';

  private _cartItems = signal<CartItem[]>([]);

  public cartItems = this._cartItems.asReadonly();

  public itemCount = computed(() => {
    return this._cartItems().reduce((total, item) => total + item.quantity, 0);
  });

  public total = computed(() => {
    return this._cartItems().reduce((total, item) => {
      return total + (item.book.preco * item.quantity);
    }, 0);
  });

  public cart = computed<Cart>(() => ({
    items: this._cartItems(),
    total: this.total(),
    itemCount: this.itemCount()
  }));

  public isEmpty = computed(() => this._cartItems().length === 0);

  constructor() {
    effect(() => {
      const items = this._cartItems();
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    });

    this.loadFromStorage();
  }

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

  addToCart(book: Book, quantity: number = 1): void {
    const currentItems = this._cartItems();
    const existingItemIndex = currentItems.findIndex(item => item.book._id === book._id);

    if (existingItemIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      this._cartItems.set(updatedItems);
    } else {
      const newItem: CartItem = { book, quantity };
      this._cartItems.set([...currentItems, newItem]);
    }
  }

  removeFromCart(bookId: string): void {
    const currentItems = this._cartItems();
    const updatedItems = currentItems.filter(item => item.book._id !== bookId);
    this._cartItems.set(updatedItems);
  }

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

  clearCart(): void {
    this._cartItems.set([]);
  }

  getItemQuantity(bookId: string): number {
    const item = this._cartItems().find(item => item.book._id === bookId);
    return item ? item.quantity : 0;
  }

  isInCart(bookId: string): boolean {
    return this._cartItems().some(item => item.book._id === bookId);
  }

  getCartSnapshot(): Cart {
    return {
      items: [...this._cartItems()],
      total: this.total(),
      itemCount: this.itemCount()
    };
  }

  getItemTotal(bookId: string): number {
    const item = this._cartItems().find(item => item.book._id === bookId);
    return item ? item.book.preco * item.quantity : 0;
  }

  validateCart(availableBooks: Book[]): CartItem[] {
    const currentItems = this._cartItems();
    const validItems = currentItems.filter(cartItem => {
      const availableBook = availableBooks.find(book => book._id === cartItem.book._id);
      return availableBook && availableBook.estoque >= cartItem.quantity;
    });

    if (validItems.length !== currentItems.length) {
      this._cartItems.set(validItems);
    }

    return validItems;
  }
}
